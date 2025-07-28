import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // required
});

export async function getEmbeddings(text: string){
  try{
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.replace(/\n/g,' ')
    })
    return response.data[0].embedding as number[];

  }catch(error){
    console.log('error calling openai embeddings api', error)
    throw error
  }
}