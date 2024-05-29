import React, { useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import { Box, Flex, IconButton, Image, LinkBox, Tag, Td, Text, Tr, VStack } from '@chakra-ui/react';

import { getDocuments } from '../../data/Documents';


interface RowProps {
    row: any;
    removeRow: (reservation: any) => void;
}

const stripped = {
    backgroundImage: 'linear-gradient(130deg, #faf9f0 44.44%, #fffceb 44.44%, #fffceb 50%, #faf9f0 50%, #faf9f0 94.44%, #fffceb 94.44%, #fffceb 100%)',
    backgroundSize: '58.74px 70.01px'
};

const Row: React.FC<RowProps> = ({ row, removeRow }) => {
    const navigate = useNavigate();
    const [metaData, setMetadata] = React.useState<any>();

    useEffect(() => {
        getVehicleData();
    }, []);

    const getVehicleData = async () => {
        if(metaData?.id === row.id) return;
        const result = await getDocuments(row.id);
        const mdt = {
            id: row.id,
            image: result?.length ? result[0] : '',
        }
        setMetadata(mdt);
    };

    return (

        <Tr cursor={'pointer'} _hover={{ bg: 'gray.100' }} style={row.data.status === 'Archived' ? stripped : {}}>
            <Td px={2}>
                <Flex>
                    <Box mr={3}>
                        {metaData?.image !== '' ? (
                            <Image
                                borderRadius="lg"
                                width="70px"
                                src={metaData?.image}
                                loading='lazy'
                            />
                        ) : null}
                    </Box>
                    <VStack textAlign={'left'} alignItems={'flex-start'} ml={2} spacing={1}>
                        <Text fontWeight={'700'}>{row?.data?.brand} {row?.data?.model} {row?.data?.year}</Text>
                        <Text>Recorrido: {parseFloat(row?.data?.milleage).toLocaleString('en-US')} Kms</Text>
                        <Text>Tipo: {row?.data?.type}</Text>
                    </VStack>
                </Flex>

            </Td>

            <LinkBox
                py={1.5} px={1.5}
                as={Td}
                onClick={() => {
                    navigate(`project/${row.id}`);
                }}
                cursor={'pointer'}
                style={{ whiteSpace: 'nowrap' }}
                _hover={{ bg: 'gray.100' }}
            >
                {row.data.plate}
            </LinkBox>
            <LinkBox
                py={1.5} px={1.5}
                as={Td}
                onClick={() => {
                    navigate(`project/${row.id}`);
                }}
                cursor={'pointer'}
                style={{ whiteSpace: 'nowrap' }}
                _hover={{ bg: 'gray.100' }}
            >
                <Flex width={'100%'}>
                    {row.data.available ? <Tag size={'sm'} variant='solid' colorScheme='yellow'>
                        Disponible
                    </Tag> : <Tag size={'sm'} variant='solid' colorScheme='red'>
                        No Disponible
                    </Tag>}
                </Flex>
            </LinkBox>


            <Td maxW={15} p={0}>
                <Flex>

                    <Box maxW={'30%'} w={'30%'}>
                        <IconButton
                            variant="ghost"
                            height={10}
                            icon={<RiDeleteBin6Line color={'#f84141'} />}
                            aria-label="toggle-dark-mode"
                            onClick={() => {
                                removeRow(row);
                            }}
                        />
                    </Box>
                </Flex>
            </Td>
        </Tr>

    );
};

export default Row;
