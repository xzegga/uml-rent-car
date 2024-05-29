import { Container, Flex, Box, Spacer, Text, Heading, Breadcrumb, BreadcrumbItem } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import Status from '../../components/Status';
import ReservationTable from '../../components/Reservations/DetailTable';
import './AddReservation.css';
import { getReservationById } from '../../data/Reservations';
import { ROLES } from '../../models/Users';
import { useStore } from '../../hooks/useGlobalStore';
import ChangeStatusSelector from '../../components/ChangeStatus';
import { ReservationObject } from '../../models/Reservation';
import Navigation from '../../components/Navigation';


const ReservationDetail: React.FC = () => {
    const { id } = useParams();
    const { currentUser } = useStore();
    const [reservation, setReservation] = React.useState<ReservationObject>();


    useEffect(() => {
        if (currentUser && id) {
            getReservationById(id).then(response => {
                setReservation(response);
            });

        }
    }, [currentUser])


    return (<>
        {currentUser && (
            <Container maxW="full" mt={0} w={'container.lg'} overflow="hidden" width={'100%'} py={4}>
                <Flex mb="1" alignItems={'start'}>
                    <Box>
                        <Heading size="md" whiteSpace={'nowrap'} pl={0}>
                            <Flex alignItems={'center'} gap={3}>
                                <Text>Detalles de reservación</Text>
                            </Flex>
                        </Heading>
                        <Breadcrumb separator="/">
                            <BreadcrumbItem>
                                <NavLink to={`/`}>Inicio</NavLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <NavLink to={`/${currentUser.role}/rentals`}>Reservaciones</NavLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Text>Detalles reservación</Text>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </Box>
                    <Spacer />
                    <Navigation />
                </Flex>


                <Box borderRadius={4} border={'1px'} borderColor={'gray.100'} p={3} pb={3} mt={10}>
                    {reservation?.data && <>
                        <Flex justifyContent={'space-between'} alignItems={'center'}>
                            <Flex alignItems={'center'}>

                            </Flex>

                            {currentUser.role === ROLES.Admin && (
                                <ChangeStatusSelector setReservation={setReservation} reservation={reservation} />
                            )}
                            {reservation.data.status && currentUser?.role === ROLES.Client && <Status status={reservation.data.status} />}
                        </Flex>
                        <ReservationTable reservation={reservation}></ReservationTable>

                    </>
                    }
                    <Spacer h={'40px'} />
                </Box>
            </Container >
        )}
    </>
    );
};

export default ReservationDetail;

