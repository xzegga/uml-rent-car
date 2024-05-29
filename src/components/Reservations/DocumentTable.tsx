import { Box, AlertDialog, useToast, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from '@chakra-ui/react';
import React from 'react';
import { DocumentObject, ProcessedDocument } from '../../models/Document';
import { deleteDocument } from '../../data/Documents';

interface DocumentsTableProps {
    documents: DocumentObject[];
    setDocuments: React.Dispatch<React.SetStateAction<DocumentObject[]>>;
    setProcessedDocuments: React.Dispatch<React.SetStateAction<ProcessedDocument[]>>
    processedDocuments: processedDocument[];
    projectId?: string;
    saving: boolean;
    downloadFile: (path: string, name: string) => void;
    uploadFile?: (file: FileList, doc: DocumentObject, target: string) => Promise<void>;
    setSaving: any;
}

interface processedDocument {
    docId: string;
    documents: DocumentObject[];
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
    documents,
    setDocuments,
    processedDocuments,
    setProcessedDocuments,
    setSaving,
 }) => {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [documentToDelete] = React.useState<any>(null)
    const onClose = () => setIsDeleting(false)
    const cancelRef = React.useRef(null)
    const toast = useToast()

    // get file extension 
    // const getFileExtension = (fileName: string) => {
    //     return fileName.split('.').pop() || '';
    // }

    // Get defaultStyles color for file extension
    // const getFileIconColor = (fileName: string) => {
    //     const ext = getFileExtension(fileName) as keyof typeof defaultStyles;
    //     return defaultStyles[ext];
    // }

    // // Get file name from absolute path
    // const getFileName = (filePath: string) => {
    //     return filePath.split('/').pop() || '';
    // }

    // const getDocumentById = (docId: string, target: string) => {
    //     const document = processedDocuments.find(doc => doc.docId === docId);
    //     let docsByTarget: DocumentObject[] = []
    //     if (document) {
    //         const [filterDocuments] = processedDocuments
    //             .filter((doc) => doc.docId === docId)
    //             .map((doc) => doc.documents);

    //         docsByTarget = filterDocuments.filter((doc) => doc.data.language === target);
    //     }
    //     return (
    //         docsByTarget.map((doc) =>
    //             <Box pb={2} key={doc.id}>
    //                 {doc.data.name &&
    //                     <Flex mr={1} justifyContent={'space-between'}>
    //                         <Flex>
    //                             <Box width={4}><FileIcon extension={getFileExtension(doc.data.name)} {...getFileIconColor(doc.data.name)} /></Box>
    //                             <Text fontSize="14px" ml={2}>
    //                                 <Tooltip label={doc.data.name} aria-label='A tooltip'>
    //                                     {shortenFileName(doc.data.name, 20)}
    //                                 </Tooltip>
    //                             </Text>
    //                         </Flex>
    //                         <Flex alignItems={'center'} justifyContent={'flex-end'}>
    //                             <Link color='blue.400' onClick={() => downloadFile(doc.data.path, doc.data.name)}>
    //                                 <Flex justifyContent={'end'} alignItems={'center'}>
    //                                     <AiOutlineDownload />
    //                                     <Text ml={2}>Download</Text>
    //                                 </Flex>
    //                             </Link>
    //                             {currentUser?.role === ROLES.Admin &&
    //                                 <>
    //                                     <Divider ml={3} orientation={'vertical'} mr={3} />
    //                                     <DeleteIcon onClick={() => removeFile(docId, doc)} cursor={'pointer'} color={'red.400'} />
    //                                 </>}
    //                         </Flex>
    //                     </Flex>}
    //             </Box>
    //         )
    //     );
    // }

    // const removeFile = async (documentId: string, doc: DocumentObject) => {
    //     setDocumentToDelete({
    //         projectId,
    //         documentId,
    //         doc,
    //     })
    //     setIsDeleting(true);
    // }


    const handleDeleteDocument = async () => {
        const { projectId, documentId, doc } = documentToDelete;
        if (projectId) {
            setSaving(true, null);
            await deleteDocument(projectId, documentId, doc)



            if (doc.data.isCertificate) {
                const newDocuments = documents.filter((doc) => doc.id !== documentId);
                setDocuments(newDocuments);
            } else {
                const index = processedDocuments.findIndex((dc) => dc.docId === documentId);
                if (index !== null) {
                    const updatedDocs = processedDocuments.slice();
                    updatedDocs[index].documents = [...updatedDocs[index].documents.filter((dc) => dc.id !== doc.id)];
                    setProcessedDocuments(updatedDocs);
                }

            }
            setSaving(false, null)
            setIsDeleting(false);
            toast({
                description: `File deleted successfully`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    return (
        <Box p={3} fontSize={'14px'}>

            <Box pb={2} mb={3} pl={1} borderBottom={'1px'} borderColor={'gray.300'} color={'gray.500'}>File List</Box>

            <AlertDialog
                isOpen={isDeleting}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Document
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handleDeleteDocument} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box >
    );
};

export default DocumentsTable;

