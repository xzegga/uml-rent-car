import { getFunctions, httpsCallable } from 'firebase/functions';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineFileExcel } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

import {
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
    AlertDialogOverlay, Box, Button, Center, Container, Flex, FormControl, FormLabel, Heading,
    Link, Select, Spacer, Tag, TagLabel, Text, useToast
} from '@chakra-ui/react';

import NavLnk from '../../components/NavLnk';
import ReservationListTable from '../../components/tables/ReservationListTable';
import TenantDropdown from '../../components/TenantDropdown';
import { deleteReservation } from '../../data/Reservations';
import { useStore } from '../../hooks/useGlobalStore';
import { ProjectObject } from '../../models/project';
import { ROLES } from '../../models/Users';
import { exportToExcel } from '../../utils/export';
import { generateYears } from '../../utils/helpers';
import { allStatuses, monthNames } from '../../utils/value-objects';
import { useAuth } from '../../context/AuthContext';
import ChangeStatusSelector from '../../components/ChangeStatus';
import { ReservationObject } from '../../models/Reservation';

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const cancelRef = useRef(null);
    const { validate } = useAuth();
    const {
        tenant,
        currentUser,
        pagination,
        status,
        monthSelected,
        yearSelected,
        tenantQuery,
        selectedIds,
        refresh,
        setState } = useStore()

    const [reservations, setReservations] = useState<ReservationObject[]>([]);
    const [reservation, setReservation] = useState<ReservationObject>();

    const [lastDoc, setLastDoc] = useState<string>();
    const [request, setRequest] = useState<string>('');
    const [requestdb, setRequestdb] = useState<string>('');
    const [count, setCount] = useState<number>()
    const [isOpen, setIsOpen] = useState(false);

    const onClose = () => setIsOpen(false);

    const fetchMore = () => {
        getReservationQuery(false);
    };

    const removeReservation = (reservation: ReservationObject) => {
        setReservation(reservation);
        setIsOpen(true);
    };

    const handleDeleteProject = async () => {
        if (currentUser && reservation) {
            await validate();
            deleteReservation(reservation.id);

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
        getReservationQuery(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthSelected, yearSelected, status, requestdb, pagination, tenantQuery]);

    useEffect(() => {
        if (refresh === true) {
            setState({ refresh: false });
            getReservationQuery(true);
        }
    }, [refresh])

    const setRequestDb = (req: string) => {
        setRequestdb(req);
    }

    const getReservationQuery = async (
        newQuery: boolean = false
    ) => {
        try {
            if (currentUser) {
                await validate();
                setState({ loading: true, loadingMore: true });
                const functions = getFunctions();
                const getAllReservations = httpsCallable(functions, 'getReservations');

                let tenant = null;
                if (currentUser.role === ROLES.Admin) {
                    tenant = tenantQuery && tenantQuery !== '' ? tenantQuery : currentUser.tenant;
                }

                const reservationData: any = await getAllReservations({
                    status,
                    monthSelected,
                    yearSelected,
                    requestdb,
                    lastDoc,
                    newQuery,
                    pagination,
                    token: currentUser.token,
                    tenant,
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

    function exportToExcelFn(): void {
        const headers = [['Request No', 'Project', 'Source Language', 'Target Language', 'Word Count', 'Total']];
        const dataArray = reservations.map((item) => (
            [
                item.data.reservationId,
                item.data.vehicleID,
                item.data.clientID,
                item.data.startDate,
                item.data.endDate,
                item.data.mileageUsed
            ]
        ));
        const data = [...headers, ...dataArray];

        const fileName = `tpm-${months[monthSelected]}-${yearSelected}.xlsx`;
        exportToExcel(data, fileName)
    }

    const handleRole = async (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setState({ tenantQuery: value })
    }

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
                        <Flex mb="1" alignItems={'center'}>
                            <Heading size="md" whiteSpace={'nowrap'} pl={3}>
                                <Flex alignItems={'center'} gap={3}>
                                    <Text>Autos Rentados</Text>
                                    {currentUser.role === 'admin' || tenant.export &&
                                        <TenantDropdown
                                            value={tenantQuery || currentUser.tenant}
                                            select={'all'}
                                            handleChange={handleRole} />
                                    }
                                </Flex>
                            </Heading>
                            <Spacer />
                            {currentUser.role === ROLES.Admin && (
                                <Flex>

                                    <Link onClick={() => navigate('users', { replace: true })} colorScheme={'blue.700'} mr={5}>
                                        Usuarios
                                    </Link>
                                    <Link onClick={() => navigate('clients', { replace: true })} colorScheme={'blue.700'} mr={5}>
                                        Clientes
                                    </Link>
                                </Flex>
                            )}
                            <Box>
                                <NavLnk to="projects/add" name="Nueva Reserva" colorScheme="blue.500" bg="blue.700" size="md" color="white">
                                    Rentar Nuevo
                                </NavLnk>
                            </Box>
                        </Flex>

                        <Box pt={10}>
                            <Box>
                                <Flex justifyContent={'flex-end'}>
                                    {/* <FormControl id="requestNumber" ml={2}>
                                        <Flex alignItems={'center'} justifyContent={'start'}>
                                            <FormLabel my={0}>Request</FormLabel>
                                            <Input w={75}
                                                value={request}
                                                type='text'
                                                onChange={(e) => {
                                                    debouncedHandleRequestChange(e.target.value);
                                                    setRequest(e.target.value)
                                                }}></Input>
                                        </Flex>
                                    </FormControl> */}
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
                                    { Request: requestdb },
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
                                {currentUser.role === ROLES.Admin ?
                                    <Flex flex={1} alignContent={'flex-end'}>
                                        <Button
                                            size={'xs'}
                                            ml={'auto'}
                                            color={'green.500'}
                                            leftIcon={<AiOutlineFileExcel />}
                                            onClick={exportToExcelFn}
                                        >Exportar a Excel</Button>
                                    </Flex>
                                    : null}

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
                                    Borrar {reservation?.data.projectId}
                                </AlertDialogHeader>

                                <AlertDialogBody>Are you sure to delete this project? All related files will be deleted and you can't undo this action afterward.</AlertDialogBody>

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
