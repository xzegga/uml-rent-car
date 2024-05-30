import { getFunctions, httpsCallable } from 'firebase/functions';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import {
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
    AlertDialogOverlay, Box, Button, Center, Container, Flex, FormControl, FormLabel, Heading, Link,
    Select, Spacer, Tag, TagLabel, Text, useToast
} from '@chakra-ui/react';

import ChangeStatusSelector from '../../components/ChangeStatus';
import ReservationListTable from '../../components/Reservations/ListTable';
import { useAuth } from '../../context/AuthContext';
import { deleteReservation } from '../../data/Reservations';
import { useStore } from '../../hooks/useGlobalStore';
import { ReservationObject } from '../../models/Reservation';
import { ROLES } from '../../models/Users';
import { generateYears } from '../../utils/helpers';
import { allStatuses, monthNames } from '../../utils/value-objects';
import Navigation from '../../components/Navigation';
import { updateAvailability } from '../../data/Vehicles';

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const Dashboard: React.FC = () => {
    const toast = useToast();
    const cancelRef = useRef(null);
    const { validate } = useAuth();
    const {
        currentUser,
        pagination,
        status,
        monthSelected,
        yearSelected,
        selectedIds,
        refresh,
        setState } = useStore()

    const [reservations, setReservations] = useState<ReservationObject[]>([]);
    const [reservation, setReservation] = useState<ReservationObject>();

    const [lastDoc, setLastDoc] = useState<string>();
    const [count] = useState<number>()
    const [isOpen, setIsOpen] = useState(false);

    const onClose = () => setIsOpen(false);

    const fetchMore = () => {
        getQuery(false);
    };

    const removeReservation = (reservation: ReservationObject) => {
        setReservation(reservation);
        setIsOpen(true);
    };

    const handleDeleteProject = async () => {
        if (currentUser && reservation) {
            await validate();
            await deleteReservation(reservation.id);
            await updateAvailability([reservation.data.vehicleId], true);

            toast({
                title: 'Reservacion borrada',
                description: 'La reserva ha sido eliminada',
                status: 'success',
                duration: 9000,
                isClosable: true
            });

            setIsOpen(false);
            const projectsCopy = [...reservations];
            const index = projectsCopy.findIndex((p) => p.id === reservation.id);
            if (index > -1) {
                projectsCopy.splice(index, 1);
                setReservations(projectsCopy);
            }
        }
    };

    const handleFilter = (e: ChangeEvent<HTMLSelectElement>) => {
        setLastDoc(undefined);
        setState({ status: e.target.value });
    };

    const handleFilterDate = (e: ChangeEvent<HTMLSelectElement>) => {
        setLastDoc(undefined);
        setState({ monthSelected: Number(e.target.value) })
    };

    useEffect(() => {
        getQuery(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthSelected, yearSelected, status, pagination]);

    useEffect(() => {
        if (refresh === true) {
            setState({ refresh: false });
            getQuery(true);
        }
    }, [refresh]);

    const getQuery = async (
        newQuery: boolean = false
    ) => {
        try {
            if (currentUser) {
                await validate();
                setState({ loading: true, loadingMore: true });
                const functions = getFunctions();
                const getAllReservations = httpsCallable(functions, 'getReservations');

                const reservationData: any = await getAllReservations({
                    status,
                    monthSelected,
                    yearSelected,
                    lastDoc,
                    newQuery,
                    pagination,
                    token: currentUser.token,
                    userId: currentUser.role === ROLES.Client ? currentUser.uid : null,
                });

                if (newQuery) {
                    setReservations(reservationData?.data?.reservations || []);
                } else {
                    setReservations([
                        ...reservations,
                        ...reservationData?.data?.reservations || []
                    ]);
                }

                setLastDoc(reservationData?.data.lastDoc || null);
                setState({ loading: false, loadingMore: false });
            }

        } catch (error) {
            // Handle error
            toast({
                title: 'Error',
                description: 'Se produjo un error al obtener el listado de reservaciones',
                status: 'error',
                duration: 9000,
                isClosable: true
            });
            setState({ loading: false, loadingMore: false });
        }
    };

    const onChangeStatusSuccess = (st: string) => {
        const newProjectStatuses = reservations.map((item) => (
            {
                ...item,
                data: {
                    ...item.data,
                    ...(selectedIds.includes(item.id) && { status: st }),
                }
            }
        ));
        setReservations(newProjectStatuses);
        setState({ selectedIds: [], status: st })
    }

    return (
        <>
            {currentUser && (
                <>
                    <Container maxW="container.lg" w={'container.lg'} overflowX="auto" py={4}>
                        <Flex mb="1" alignItems={'start'}>
                            <Heading size="md" whiteSpace={'nowrap'} pl={0}>
                                <Flex alignItems={'center'} gap={3}>
                                    <Text>Autos Rentados</Text>
                                </Flex>
                            </Heading>

                            <Spacer />
                            <Navigation />
                        </Flex>

                        <Box pt={10}>
                            <Box>
                                <Flex justifyContent={'flex-end'}>
                                    <FormControl id="year_selection" ml={3} maxW={140}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Año</FormLabel>
                                            <Select
                                                w={90}
                                                ml={1}
                                                name={'yearSelected'}
                                                id={'yearSelected'}
                                                value={yearSelected}
                                                onChange={(e) => setState({ yearSelected: Number(e.target.value) })}
                                            >
                                                {generateYears().map((s, index) => (
                                                    <option key={index} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Flex>
                                    </FormControl>
                                    <FormControl id="month_selection" ml={6}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Mes</FormLabel>
                                            <Select minW={140} ml={1} name={'monthSelected'} id={'monthSelected'} value={monthSelected} onChange={handleFilterDate}>
                                                {/* <option value={-1}>All</option> */}
                                                {monthNames.map((s, index) => (
                                                    <option key={index} value={s.value}>
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Flex>
                                    </FormControl>
                                    <FormControl id="language_requested" ml={6}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Estado</FormLabel>
                                            <Select minW={140} ml={1} name={'status'} id={'status'} value={status} onChange={handleFilter}>
                                                {allStatuses.map((s: string, index) => (
                                                    <option key={index} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                                {currentUser.role === ROLES.Admin ?
                                                    <option value={'Billing'}>
                                                        Billing
                                                    </option> : null
                                                }
                                            </Select>
                                        </Flex>
                                    </FormControl>
                                    <FormControl id="page_size" ml={6}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Mostrar</FormLabel>
                                            <Select w={'70px'} ml={1} name={'page'} id={'page'}
                                                value={pagination} onChange={(e) => setState({ pagination: e.target.value })}>
                                                {['All', '10', '20', '50'].map((s: string, index) =>
                                                    <option key={index} value={s}>
                                                        {s}
                                                    </option>
                                                )}
                                            </Select>
                                        </Flex>
                                    </FormControl>
                                </Flex>
                            </Box>
                        </Box>
                        <Box>
                            <Flex gap={4} pt={5} pl={0} alignItems={'center'}>
                                {[
                                    { 'Año': yearSelected },
                                    { Mes: monthSelected },
                                    { Estado: status }
                                ].map((obj, index) => (
                                    <Box key={index}>
                                        {
                                            Object.keys(obj)[0] === 'Request' && Object.values(obj)[0] !== '' ?
                                                <Flex gap={3}>
                                                    <Tag size={'sm'} key={index} variant='outline' colorScheme='blue'>
                                                        <TagLabel>{Object.keys(obj)[0]}: {Object.values(obj)[0]}</TagLabel>
                                                    </Tag>
                                                    <Text fontSize={'xs'}>Filtros Ignorados:</Text>
                                                </Flex> :
                                                <>{
                                                    !['', -1,].includes(Object.values(obj)[0]) ?
                                                        <Tag size={'sm'} key={index} variant='outline' colorScheme='blue'>
                                                            <TagLabel>
                                                                {Object.keys(obj)[0]}: {
                                                                    Object.keys(obj)[0] === 'Month' ?
                                                                        months[Object.values(obj)[0]] : Object.values(obj)[0]
                                                                }
                                                            </TagLabel>
                                                        </Tag> : null
                                                }</>
                                        }

                                    </Box>
                                ))}

                            </Flex>
                        </Box>
                        {currentUser.role === ROLES.Admin && selectedIds?.length ?
                            <Box borderTop={1} borderTopColor={'black'} bgColor={'yellow.50'}
                                color={'black'} overflow={'hidden'} mt={4}>
                                <Flex alignItems={'center'} gap={3} py={2} px={4}
                                >
                                    <Text>Cambiar Estado</Text>
                                    <ChangeStatusSelector ids={selectedIds} onSuccess={onChangeStatusSuccess} />
                                </Flex>
                            </Box>
                            : null}
                        <Box>
                            <ReservationListTable
                                reservations={reservations}
                                removeReservation={removeReservation} />
                            <Spacer mt={10} />
                            <Center>
                                Mostrando {reservations.length} de {count ? count : 0} autos rentados
                            </Center>
                            <Center>
                                {count && count > reservations.length && (
                                    <Link onClick={fetchMore} color={'blue.700'}>
                                        Cargar más...
                                    </Link>
                                )}
                            </Center>
                        </Box>
                    </Container>

                    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                    Borrar {reservation?.id}
                                </AlertDialogHeader>

                                <AlertDialogBody>¿Estás seguro de que deseas eliminar esta reservación? Todos los archivos relacionados serán eliminados y no podrás deshacer esta acción posteriormente.</AlertDialogBody>

                                <AlertDialogFooter>
                                    <Button ref={cancelRef} onClick={onClose}>
                                        Cancelar
                                    </Button>
                                    <Button colorScheme="red" onClick={handleDeleteProject} ml={3}>
                                        Eliminar
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                </>
            )}
        </>
    );
};

export default Dashboard;
