"use client"
import { ModeToggle } from "@/components/dark-mode-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'
import { useChat } from "ai/react"
import { useRef, useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";



    
export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: 'api/chat',
        onError: (e) => {
            console.log(e)
        }
    })
    const chatParent = useRef<HTMLUListElement>(null)

    useEffect(() => {
        const domNode = chatParent.current
        if (domNode) {
            domNode.scrollTop = domNode.scrollHeight
        }
    })
  return (
    <main className = "relative container flex min-h-screen flex-col">
      <header className=" relative p-4 border-b-2 w-full mx-auto gap-4 ">
        <div className=" flex justify-between">
          <h1 className="text-2xl font-bold">Learning Pathway for Exceptional Learners </h1>
          <div className="flex items-center space-x-4">
              <ModeToggle/>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton showName />
              </SignedIn>
          </div>
        </div>
      </header>
      <section className="container px-0 pt-5 pb-5 flex flex-col flex-grow gap-4 mx-auto w-full">
                <ul ref={chatParent} className="h-1 p-4 flex-grow bg-muted/50 rounded-lg w-full overflow-y-auto flex flex-col gap-4">
                    {messages.map((m, index) => (
                        <div key={index}>
                            {m.role === 'user' ? (
                                <li key={m.id} className="flex flex-row">
                                    <div className="rounded-xl p-4 bg-background shadow-md flex">
                                        <p className="text-primary">{m.content}</p>
                                    </div>
                                </li>
                            ) : (
                                <li key={m.id} className="flex flex-row-reverse">
                                    <div className="rounded-xl p-4 bg-background shadow-md flex w-3/4">
                                        <p className="text-primary">{m.content}</p>
                                    </div>
                                </li>
                            )}
                        </div>
                    ))}
                </ul >
            </section>
      
      <footer className="mt-auto p-4 border-t-2" >
        <form className="flex flex-col space-y-2" onSubmit={handleSubmit}>
          <div className="relative">
            <Input type ="text" 
            value={input} onChange={handleInputChange}
            placeholder="Type your question here..." 
            className="pr-40 h-15 py-4 pl-5" />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button type="button" variant="ghost" size="icon">
                <FontAwesomeIcon icon={faPaperclip} className="h-6 w-6" />
              </Button>
              <Button type="submit" size="sm">
                Submit
              </Button>
              </div>
          </div>
        </form>
      </footer>
      
    </main>
  );
}
