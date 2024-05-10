import React from 'react';
import { Box, Center, Flex, Spinner, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useStore } from '../../hooks/useGlobalStore';
import ReservationRow from './ReservationRow';
import { ReservationObject } from '../../models/Reservation';

interface ReservationListTableProps {
    reservations: ReservationObject[];
    removeReservation: (reservation: ReservationObject) => void;
}

const ReservationListTable: React.FC<ReservationListTableProps> = ({ reservations, removeReservation }) => {
    const { loading, loadingMore } = useStore()

    return (
        <Box position={'relative'}>
            {!loading || loadingMore ? <>
                {loadingMore && <Flex
                    h={'100%'}
                    style={{
                        position: 'absolute',
                        left: 0, right: 0, top: 0, bottom: 0,
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        zIndex: 10
                    }}
                    position={'absolute'}
                    alignItems={'center'}
                ><Spinner size='xl' mx={'auto'} /></Flex>}
                {reservations.length ?
                    <Table variant='simple' mt='5'>
                        <Thead>
                            <Tr>
                                <Th px={0} pl={'15px'}></Th>
                                <Th px={1} textAlign={'center'}>Reserva</Th>
                                <Th px={1} textAlign={'center'}>Cliente</Th>
                                <Th px={1} textAlign={'center'}>Vehículo</Th>
                                <Th px={1} textAlign={'center'}>Fecha Inicio</Th>
                                <Th px={1} textAlign={'center'}>Fecha Fin</Th>
                                <Th px={1} textAlign={'center'}>Status</Th>
                                <Th maxW={20}></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {reservations.map((reservation: ReservationObject) => (
                                <ReservationRow 
                                    key={reservation.id}
                                    reservation={reservation}
                                    removeReservation={removeReservation} />
                            ))}
                            {reservations.length === 0 ? <Tr><Td colSpan={6}>
                                <Center>Reserva no encontrada</Center>
                            </Td></Tr> : null}
                        </Tbody>
                    </Table >
                    : null}
            </> :
                <Flex h={'500px'} justifyContent={'center'} alignItems={'center'}><Spinner size='xl' /></Flex>
            }

        </Box>
    );
};

export default ReservationListTable;
