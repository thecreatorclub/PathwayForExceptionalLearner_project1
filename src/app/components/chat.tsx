"use client";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faTimesCircle,faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { useChat } from "ai/react";
import { useRef, useEffect, useState } from 'react';
import UploadFile from "../api/upload/uploadfile";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { vscDarkPlus as dark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function Chat() {
  const [uploadedContent, setUploadedContent] = useState<string>("");
    const { messages, input, handleInputChange, handleSubmit } = useChat({
        api: 'api/chat',
        onError: (e) => {
            console.log(e)
        },
        body: {
          fileData: uploadedContent
        },
    });
    const chatParent = useRef<HTMLUListElement>(null);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        const domNode = chatParent.current;
        if (domNode) {
            domNode.scrollTop = domNode.scrollHeight;
        }
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleRemoveFile = () => {
      setShowUpload(false);
      setUploadedContent("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    const handleFileUpload = (content: string) => {
        console.log('File content uploaded:', content);
        setShowUpload(false);
        setUploadedContent(content);
    };

    const enhancedHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const enhancedInput = `${input} ${uploadedContent}`;
        handleSubmit(e as React.FormEvent<HTMLFormElement & { input: HTMLInputElement }> & { input: { value: string } });
    };
    


    return (
        <main className="relative container flex min-h-screen flex-col">
            <header className="relative p-4 border-b-2 w-full mx-auto gap-4">
                <div className="flex justify-between">
                    <h1 className="text-2xl font-bold">Learning Pathway for Exceptional Learners</h1>
                    <div className="flex items-center space-x-4">
                        <ModeToggle />
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton/>
                        </SignedOut>
                    </div>
                </div>
            </header>

            <section className="container px-0 pt-5 pb-5 flex flex-col flex-grow gap-4 mx-auto w-full">
                <ul ref={chatParent} className="h-1 p-4 flex-grow bg-muted/50 rounded-lg w-full overflow-y-auto flex flex-col gap-4">
                    {/* {uploadedContent && (
                        <li className="flex flex-row">
                            <div className="rounded-xl p-4 bg-background shadow-md flex">
                                <p className="text-primary">Uploaded content: {uploadedContent.slice(0, 100)}...</p>
                            </div>
                        </li>
                    )} */}
                    {messages.map((m, index) => (
                        <div key={index}>
                            {m.role === 'user' ? (
                                <li key={m.id} className="flex flex-row-reverse">
                                    <div className="rounded-xl p-4 bg-background shadow-md flex ">
                                        {/* <p className="text-primary" dangerouslySetInnerHTML={{ __html: marked(m.content)}} /> */}
                                        <p className="text-primary prose dark:prose-invert"><Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown></p>
                                    </div>
                                </li>
                            ) : (
                                <li key={m.id} className="flex flex-row">
                                    <div className="rounded-xl p-4 bg-background shadow-md flex ">
                                        {/* <p className="text-primary" dangerouslySetInnerHTML={{ __html: marked(m.content)}} /> */}
                                        <p className="text-primary prose dark:prose-invert"><Markdown remarkPlugins={[remarkGfm]}
                                        components={{
                                          code(props) {
                                            const {children, className, node, ...rest} = props
                                            const match = /language-(\w+)/.exec(className || '')
                                            return match ? (
                                              <SyntaxHighlighter
                                                // {...rest}
                                                PreTag="div"
                                                children={String(children).replace(/\n$/, '')}
                                                language={match[1]}
                                                style={dark}
                                                wrapLines={true}
                                                wrapLongLines={true}
                                              />
                                            ) : (
                                              <code {...rest} className={className}>
                                                {children}
                                              </code>
                                            )
                                          },
                                        }}>{m.content}</Markdown></p>
                                    </div>
                                </li>
                            )}
                        </div>
                    ))}
                </ul>
            </section>

            <footer className="mt-auto p-4 border-t-2">
                <form className="flex flex-col space-y-2" onSubmit={enhancedHandleSubmit}>
                      {uploadedContent && (
                      <div className="bg-secondary text-secondary-foreground p-2 rounded-md flex items-center justify-between mb-2 max-w-xs">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary text-primary-foreground rounded-md p-2">
                            <FontAwesomeIcon icon={faFileAlt} className="h-5 w-4" />
                          </div>
                          <p className="text-primary">{uploadedContent.slice(0, 100)}...</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-gray-400 hover:text-white"
                        >
                          <FontAwesomeIcon icon={faTimesCircle} className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="relative">
                        <Input type="text"
                            value={input} onChange={handleInputChange}
                            placeholder="Type your question here..."
                            className="pr-40 h-15 py-4 pl-5" />
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                            <Button type="button" variant="link" size="icon" onClick={() => setShowUpload(true)}>
                                <FontAwesomeIcon icon={faPaperclip} className="h-6 w-6" />
                            </Button>
                            <Button type="submit" size="sm">
                                Submit
                            </Button>
                        </div>
                    </div>
                </form>
                {/* {showUpload && 
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-4 rounded">
                            <UploadFile onFileUpload={handleFileUpload} />
                            <Button onClick={() => setShowUpload(false)}>Close</Button> 
                        </div>
                    </div>
                } */}
                {showUpload && 
    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow-lg w-96">
            <div className="mb-4 text-center">
                <h2 className="text-xl font-semibold text-white">Upload Your PDF Here</h2>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-inner">
                <UploadFile onFileUpload={handleFileUpload} />
            </div>
            <div className="mt-4 flex justify-end">
                <button 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setShowUpload(false)}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
}

            </footer>
        </main>
    );
}


