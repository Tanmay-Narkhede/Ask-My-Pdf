// Import the Pinecone library
import { Pinecone} from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {Document, RecursiveCharacterTextSplitter} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from './embeddings';
import { createHash } from 'crypto';
import { convertToAscii } from './utils';

// Initialize a Pinecone client with your API key 
let pinecone: Pinecone | null = null;

export const getPineconeClient = () => {
  if (!pinecone){

  pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
}
  return pinecone;
};

type PDFpage = {
  pageContent: string;
  metadata:{
    loc: {pageNumber: number};
  }
}

export async function loadS3IntoPinecone(fileKey: string) {
    // 1.obtain the pdf -> download and read from pdf
    console.log('Downloading file from S3');
    const file_name = await downloadFromS3(fileKey);
    if (!file_name) {
      throw new Error('could not download from the s3 bucket');
    }
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFpage[];


    // 2. split and segment the pdf
    const documents = await Promise.all(pages.map(prepareDocument));

    //3. vectorise and embed individual socuments
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    //4. upload to pinecone
    const client = await getPineconeClient()
    const pineconeIndex = client.Index('ask-my-pdf') // uploading the embeddingd to the index we created in the pinecone
   
    console.log('Uploading Vectors in pinecone')
    const namespace = convertToAscii(fileKey)
     console.log(`Uploading ${vectors.length} vectors to Pinecone in namespace '${namespace}'...`);
  const batchSize = 10;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await pineconeIndex.namespace(namespace).upsert(batch);
  }
  console.log('✅ Upload to Pinecone complete.');

  return documents[0];
}

 async function embedDocument(doc: Document){
  try {
    const embeddings = await getEmbeddings(doc.pageContent)
    const hash = createHash('md5').update(doc.pageContent).digest('hex');

    return{
      id: hash,
      values: embeddings,
      metadata: {
        text: String(doc.metadata.text),
        pageNumber: Number(doc.metadata.pageNumber)
      },
     };
    
  } catch (error) {
    console.log("error embedding Document", error)
    throw error
  }
 }
 
export const truncateStringByBytes = (str: string, bytes: number)=>{
    const enc = new TextEncoder();
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0,bytes))
}

async function prepareDocument(page: PDFpage) {
  const {pageContent: originalPageContent, metadata} = page;
  const pageContent = originalPageContent.replace(/\n/g, ' ') // replace new lines with spaces

  //split the docs
  const splitter = new RecursiveCharacterTextSplitter({});
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000) // truncate to 36000 bytes

      }
})
  ])
  return docs;
}