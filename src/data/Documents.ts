import { DocumentReference, DocumentData, addDoc, collection, Timestamp, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { deleteObject, getDownloadURL, listAll, ref, uploadBytesResumable } from 'firebase/storage';
import { Doc, DocumentObject } from '../models/Document';

import { db, storage } from '../utils/init-firebase';

export const saveDocuments = (documents: Doc[], vehicleRef: DocumentReference<DocumentData>) => {
    const promises: any[] = [];
    documents.map(async (doc: Doc) => {
        const path = `/vehicles/${doc.file.name}`;

        const storageRef = ref(storage, path);

        const uploadTask = uploadBytesResumable(storageRef, doc.file);
        promises.push(uploadTask);
    });

    Promise.all(promises)
        .then((files) => {
            const documentRef = collection(vehicleRef, 'documents');

            files.forEach(async (file) => {
                await addDoc(documentRef, {
                    created: Timestamp.now(),
                    name: file.metadata.name,
                    path: file.metadata.fullPath
                });
            });

            return 'success';
        })
        .catch((error) => {
            console.error(error.message);
        });
};

export const deleteDocument = async (vehicleId: string, documentId: string, document: DocumentObject) => {
    // Deleting phisical file
    const storageRef = ref(storage, document.data.path);
    await deleteObject(storageRef);

    // Deleting document reference
    const vehicleRef = doc(collection(db, 'vehicles'), vehicleId);
    const documentRef = doc(collection(vehicleRef, 'documents'), documentId);
    const targetDocumentsRef = doc(collection(documentRef, 'documents'), document.id);

    await deleteDoc(targetDocumentsRef);
};

export const getDocuments = async (vehicleId: string, table: string = 'vehicles') => {
    if (vehicleId) {
        const vehicleRef = doc(collection(db, table), vehicleId);
        const documentsRef = collection(vehicleRef, 'documents');
        const querySnapshot = await getDocs(documentsRef);

        const promises: any[] = [];

        // Extract and process image URLs
        querySnapshot.docs.map((doc) => {
            const documentData = doc.data();
            const imageUrl = documentData?.path; // Check for existence of imageUrl field

            // Handle cases where imageUrl might be missing
            if (imageUrl) {
                console.log(imageUrl)
                const imageRef = ref(storage, imageUrl);

                const downloadTask = getDownloadURL(imageRef);
                promises.push(downloadTask);
            } else {
                // You can handle missing URLs here (e.g., return an empty string or a placeholder)
                return ''; // Replace with your desired behavior for missing URLs
            }
        });
        const results = await Promise.all(promises)
        console.log({results})
        return results;
    }
};


export const deleteDocuments = async (path: string) => {
    if (path.length) {
        const storageRef = ref(storage, path);
        listAll(storageRef).then(async (list) => {
            list.items.map(async (item) => {
                const itemRef = ref(storage, item.fullPath);
                await deleteObject(itemRef);
            });
        });
    }
};
