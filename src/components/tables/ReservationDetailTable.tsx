import { Timestamp } from 'firebase/firestore';

import {
   Center, Flex, Table, Tbody, Td, Text, Tr
} from '@chakra-ui/react';

import { useStore } from '../../hooks/useGlobalStore';

import { transfromTimestamp } from '../../utils/helpers';

import { ReservationObject } from '../../models/Reservation';

export interface ReservationTableProps {
    reservation: ReservationObject;
    setUpdate?: (arg: boolean) => void
}


const ReservationTable: React.FC<ReservationTableProps> = ({ reservation }) => {

    return (
        <Center>
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
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Id Cliente:</Text> </Td>
                        <Td>
                            <Flex>
                                {reservation?.data?.clientID}
                            </Flex>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Id Vehículo:</Text> </Td>
                        <Td>
                            <Flex>
                                {reservation?.data?.vehicleID}
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
                        <Td maxW='35%' w={'35%'}><Text fontWeight={'bold'}>Creada Date:</Text></Td>
                        <Td>{reservation.data.created && transfromTimestamp((reservation.data.created as Timestamp))}</Td>
                    </Tr>
                </Tbody>
            </Table>
        </Center >
    );
}

export default ReservationTable;