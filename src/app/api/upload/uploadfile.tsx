"use client";
import React, { ChangeEvent, useState } from 'react';
import { readFileContent } from '../upload/fileUtils';

function UploadFile({ onFileUpload }: { onFileUpload: (content: string) => void }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedFile(file || null);
        if (file) {
            const content = await readFileContent(file);
            onFileUpload(content);
        }
    };

    return (
        <div>
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            {selectedFile && <p>Selected file: {selectedFile.name}</p>}
        </div>
    );
}

export default UploadFile;

 