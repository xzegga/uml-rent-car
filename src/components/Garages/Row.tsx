import React, { useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import {
    Box, Text, Flex, IconButton, LinkBox, Td, Tr,
    Image,
    VStack
} from '@chakra-ui/react';

import { getDocuments } from '../../data/Documents';
import { getVehicleById } from '../../data/Vehicles';

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
        const result = await getDocuments(row.data.vehicleId,);
        const vehicle = await getVehicleById(row.data.vehicleId);
        const metaData = {
            id: row.id,
            data: vehicle.data,
            image: result?.length ? result[0] : '',
        }
        setMetadata(metaData);
    };

    return (

        <Tr cursor={'pointer'} _hover={{ bg: 'gray.100' }} style={row.data.status === 'Archived' ? stripped : {}}>

            <Td py={1.5} px={1.5}>
                <VStack textAlign={'left'} alignItems={'flex-start'} ml={2} spacing={1}>
                    <Text fontWeight={'700'}>{row.data.name}</Text>
                    <Text>Capacidad: {row.data.capacity}</Text>
                </VStack>

            </Td>
            <Td  py={1.5} px={1.5} maxW={'220px'}>
                <Text>{row.data.location}</Text>
            </Td>
            <Td py={1.5} px={1.5}>
                <Flex>
                    <Box>
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
                        <Text>{metaData?.data?.brand} {metaData?.data?.model} {metaData?.data?.year}</Text>
                        <Text>Recorrido: {parseFloat(metaData?.data?.milleage).toLocaleString('en-US')} Kms</Text>
                        <Text>Tipo: {metaData?.data?.type}</Text>
                    </VStack>
                </Flex>

            </Td>

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
        </Tr >

    );
};

export default Row;
