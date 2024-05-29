import { Timestamp } from "firebase/firestore";

export interface Document {
    created: Timestamp;
    name: string;
    path: string;
}

export interface DocumentObject {
    id: string;
    data: Document;
}

export interface Doc {
    file: File;
}

export interface ProcessedDocument {
    docId: string;
    documents: DocumentObject[];
}