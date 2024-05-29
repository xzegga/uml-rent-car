import { getFunctions, httpsCallable } from 'firebase/functions';
import React, { useEffect, useRef, useState } from 'react';

import {
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
    AlertDialogOverlay, Box, Breadcrumb, BreadcrumbItem, Button, Container, Flex, Heading, Spacer, Text, useToast
} from '@chakra-ui/react';

import ListTable from '../../components/Vehicles/ListTable';
import Navigation from '../../components/Navigation';
import NavLnk from '../../components/NavLnk';
import { useAuth } from '../../context/AuthContext';
import { deleteVehicle as deleteItem } from '../../data/Vehicles';
import { useStore } from '../../hooks/useGlobalStore';
import { NavLink } from 'react-router-dom';
import { RepeatIcon } from '@chakra-ui/icons';

const getFunction = 'getVehicles';

const Vehicles: React.FC = () => {

    const toast = useToast();
    const cancelRef = useRef(null);
    const { validate } = useAuth();
    const {
        currentUser,
        vehicles,
        setState } = useStore()

    const [items, setItems] = useState<any[]>([]);
    const [item, setItem] = useState<any>();
    const [isOpen, setIsOpen] = useState(false);

    const onClose = () => setIsOpen(false);

    const removeItem = (row: any) => {
        setItem(row);
        setIsOpen(true);
    };

    const handleDeleteItem = async () => {
        if (currentUser && item) {
            await validate();
            deleteItem(item.id);
            toast({
                title: 'Item eliminado',
                description: 'Registro eliminado correctamente',
                status: 'success',
                duration: 9000,
                isClosable: true
            });

            setIsOpen(false);
            const itemsCopy = [...items];
            const index = itemsCopy.findIndex((p) => p.id === item.id);
            if (index > -1) {
                itemsCopy.splice(index, 1);
                setItems(itemsCopy);
            }
        }
    };


    useEffect(() => {
        if (vehicles.length === 0) {
            getQuery();
            return;
        }

        setItems(vehicles);
    }, []);

    const getQuery = async () => {
        try {
            if (currentUser) {
                await validate();
                setState({ loading: true, loadingMore: true });
                const functions = getFunctions();
                const getAllItems = httpsCallable(functions, getFunction);

                const results: any = await getAllItems({});

                setItems([
                    ...results?.data?.items || []
                ]);

                setState({
                    loading: false, loadingMore: false, vehicles: [
                        ...results?.data?.items || []
                    ]
                });
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


    return (
        <>
            {currentUser && (
                <>
                    <Container maxW="container.lg" w={'container.lg'} overflowX="auto" py={4}>
                        <Flex mb="1" alignItems={'start'}>
                            <Box>
                                <Heading size="md" whiteSpace={'nowrap'} pl={0}>
                                    <Flex alignItems={'center'} gap={3}>
                                        <Text>Vehículos</Text>
                                    </Flex>
                                </Heading>
                                <Breadcrumb separator="/">
                                    <BreadcrumbItem>
                                        <NavLink to={`/`}>Inicio</NavLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbItem>
                                        <Text>Vehículos</Text>
                                    </BreadcrumbItem>
                                </Breadcrumb>
                            </Box>
                            <Spacer />
                            <Navigation />
                        </Flex>

                        <Box pt={10}>
                            <Box>
                                <Flex justifyContent={'flex-end'} alignItems={'center'}>

                                    <RepeatIcon onClick={getQuery} color="gray.500" fontSize={22} cursor={'pointer'}/>

                                    <Box ml={3}>
                                        <NavLnk to="add" name="Vehículo Nuevo" colorScheme="blue.500" bg="blue.700" size="md" color="white">
                                            Vehículo Nuevo
                                        </NavLnk>
                                    </Box>
                                </Flex>
                            </Box>
                        </Box>
                        <Box>
                            <ListTable
                                rows={items}
                                removeRow={removeItem} />
                            <Spacer mt={10} />
                        </Box>
                    </Container>

                    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                    Borrar {item?.data.id}
                                </AlertDialogHeader>

                                <AlertDialogBody>¿Estás seguro de que deseas eliminar el item seleccionado? Todos los archivos relacionados serán eliminados y no podrás deshacer esta acción posteriormente.</AlertDialogBody>

                                <AlertDialogFooter>
                                    <Button ref={cancelRef} onClick={onClose}>
                                        Cancelar
                                    </Button>
                                    <Button colorScheme="red" onClick={handleDeleteItem} ml={3}>
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

export default Vehicles;
