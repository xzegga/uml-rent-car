import { CheckCircleIcon, DeleteIcon } from '@chakra-ui/icons';
import { List, ListItem, Flex, Box, ListIcon, Heading, Text, Button } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { shortenFileName } from '../utils/helpers';
import './Styles.css';
import { Doc } from '../models/Document';

interface DropZoneProps {
    setFileList: React.Dispatch<React.SetStateAction<Doc[]>>;
    targetLanguage?: string;
}

const baseStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    outline: 'none',
    transition: 'border .24s ease-in-out',
    width: '100%',
};

const focusedStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

const DropZone: React.FC<DropZoneProps> = ({ setFileList }) => {
    // const [files, setFiles] = useState<File[]>([]);
    const [selectedFiles, setSelectedFile] = useState<Doc[]>([]);

    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
        open
    } = useDropzone({
        onDrop: acceptedFiles => {
            setSelectedFile([
                ...selectedFiles,
                ...acceptedFiles.map(file => (
                    { file }
                ))
            ]);
        }
    });

    const openFileWindows = () => {
        open();
    }

    useEffect(() => {
        setFileList(selectedFiles);
    }, [selectedFiles]);

    const removeFile = (file: File) => {
        setSelectedFile(selectedFiles.filter(f => f.file !== file));
    }

    const filesList = selectedFiles.map((doc: Doc) => {
        const { file } = doc;
        return (
            <ListItem key={file.name}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <Flex alignItems={'center'} justifyContent={'flex-start'}>
                        <Box minW={250} mr={5}>
                            <ListIcon as={CheckCircleIcon} color='green.500' />
                            {shortenFileName(file.name, 20)}
                        </Box>
                    </Flex>
                    <DeleteIcon onClick={() => removeFile(file)} cursor={'pointer'} color={'red.400'} />
                </Flex>
            </ListItem>
        )
    });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);

    return (
        <>
            <Flex flexDirection={'column'} justifyContent={'center'} minH={'100%'} cursor={'pointer'}>
                <Box {...getRootProps({ style, className: 'dropzone' })} flex={1} justifyContent={'center'}>
                    <input {...getInputProps()} />
                    <Flex direction={'column'} alignItems={'center'}>
                        <Text mb={3} colorScheme={'blue.900'} fontWeight={'bold'}>Arrastra y suelta la imagen aquí, o haz clic para seleccionar archivos.</Text>
                        <Button leftIcon={<AiOutlineCloudUpload />} onClick={openFileWindows}>Subir Archivo</Button>
                    </Flex>
                </Box>
                <Box>
                    {filesList.length > 0 && <Heading as='h6' mt={3} mb={2} size={'md'}>Files</Heading>}
                    <List spacing={3} m={3}>
                        {filesList}
                    </List>
                </Box>
            </Flex>
        </>
    );
};


//const he: GroupBase<string>[]

export default DropZone;
