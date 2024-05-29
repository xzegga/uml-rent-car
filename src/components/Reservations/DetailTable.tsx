import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Center, Flex, Image, Table, Tbody, Td, Text, Tr } from '@chakra-ui/react';

import { getDocuments } from '../../data/Documents';
import { getUserDataById } from '../../data/users';
import { getVehicleById } from '../../data/Vehicles';
import { ReservationObject } from '../../models/Reservation';
import { transfromTimestamp } from '../../utils/helpers';

export interface ReservationTableProps {
    reservation: ReservationObject;
    setUpdate?: (arg: boolean) => void
}


const ReservationTable: React.FC<ReservationTableProps> = ({ reservation }) => {
    const [metaData, setMetadata] = useState<any>();

    useEffect(() => {
        getVehicleData();
    }, []);

    const getVehicleData = async () => {
        if(reservation) {
            const result = await getDocuments(reservation.data.vehicleId);
            const vehicle = await getVehicleById(reservation.data.vehicleId);
            const user = await getUserDataById(reservation.data.userId);
            const metaData = {
                id: reservation.id,
                data: vehicle.data,
                image: result?.length ? result[0] : '',
                user: user.data,
            }
            setMetadata(metaData);
        }
    };
    return (
        <Center>
            {metaData?.image !== '' ? (
                    <Image
                        borderRadius="lg"
                        width="210px"
                        src={metaData?.image}
                        loading='lazy'
                        mr={5}
                    />
                ) : null}
            <Table variant='simple' size='sm' mt='5'>
                <Tbody>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Id Reserva:</Text> </Td>
                        <Td>
                            <Flex>
                                {reservation?.id}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Cliente:</Text> </Td>
                        <Td>
                            <Flex>
                                {metaData?.user?.name}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Id Vehículo:</Text> </Td>
                        <Td>
                            <Flex>
                            {metaData?.data?.brand} {metaData?.data?.model} {metaData?.data?.year}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Fecha Inicio:</Text></Td>
                        <Td>{reservation.data.created && transfromTimestamp((reservation.data.startDate as Timestamp))}</Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Fecha Fin:</Text></Td>
                        <Td>{reservation.data.created && transfromTimestamp((reservation.data.endDate as Timestamp))}</Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Fecha de Creación:</Text></Td>
                        <Td>{reservation.data.created && transfromTimestamp((reservation.data.created as Timestamp))}</Td>
                    </Tr>
                </Tbody>
            </Table>
        </Center >
    );
}

export default ReservationTable;