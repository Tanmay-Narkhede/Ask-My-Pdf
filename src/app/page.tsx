
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { LogIn } from "lucide-react";
import Link from "next/link";


export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  return(
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-200 to-cyan-200">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-bold ">Ask MY PDF</h1>
            <UserButton/>
          </div>
          <div className="flex mt-2">
            {isAuth && <Link href= "/chat"><Button>Go to Chats</Button></Link>}
          </div>
          <p className="max-w-xl mt-2 text-lg text-slate-600">
            Just upload your PDF and ask questions about it.
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload/>
            ):(
              <Link href= "/sign-in">
              <Button>
                Login to get Started
                <LogIn className="m-4 h-4 ml-2"/>              
              </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  ) ;
}
