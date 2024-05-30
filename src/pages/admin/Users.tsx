import {
    Table, Thead, Tr, Th, Tbody, Td, Button, Select, Image, Flex, Text,
    Box, useToast, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay, Breadcrumb, BreadcrumbItem, Spacer,
    Spinner, Heading, Container,
} from '@chakra-ui/react';
import { setDoc, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import 'firebase/functions'; // Import the functions module
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { db } from '../../utils/init-firebase';
import { ROLES } from '../../models/Users';
import { useStore } from '../../hooks/useGlobalStore';
import { getAllUsers, removeUser } from '../../data/users';
import { useAuth } from '../../context/AuthContext';
import Navigation from '../../components/Navigation';


const Users: React.FC = () => {
    const { currentUser, loading, setState } = useStore();
    const { validate } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const toast = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const onClose = () => setIsOpen(false)
    const cancelRef = useRef(null)
    const [user, setUser] = useState<any>({})
    const navigate = useNavigate();

    useEffect(() => {
        getUsers();
    }, [])

    const getUsers = async () => {
        if (currentUser && currentUser.role === ROLES.Admin) {
            const response = await getAllUsers();
            if (response.length) setUsers(response);
        }
    }

    const handleRole = async (e: ChangeEvent<HTMLSelectElement>, user: any) => {
        setState({ loading: true })
        const name = e.target.name;
        const value = e.target.value;

        if (user?.data && user?.id) {
            try {
                await validate();
                const updatedUsers = [...users];
                const usr = updatedUsers.find(usr => usr.id === user.id)
                usr.data = {
                    ...usr.data,
                    ...(value && { [`${name}`]: value }),
                }

                setUsers(updatedUsers)

                await setDoc(doc(db, 'users', user?.id), {
                    ...user?.data,
                    ...(value && { [`${name}`]: value }),
                });

                const userWithClaims = {
                    email: user.data.email,
                    customClaims: {
                        ...(value && { [`${name}`]: value }),
                    },
                    token: currentUser.token
                }
                await assignCustomClaims(userWithClaims);

                toast({
                    description: 'User claims updated',
                    status: 'info',
                    duration: 9000,
                    isClosable: true,
                })
            } catch (error) {
                toast({
                    description: 'Error updating claims',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })
            }
        }
    }

    const assignCustomClaims = async (userWithClaims: any) => {
        try {
            const functions = getFunctions();
            const callableAssignCustomClaims = httpsCallable(functions, 'assignUserClaims');

            await callableAssignCustomClaims(userWithClaims);
        } catch (error) {
            // Handle error
            console.error(error);
        } finally {
            setState({ loading: false })
        }
    };

    const handleDeleteUser = async () => {
        setIsOpen(false)
        setState({ loading: true })
        if (user) {
            await validate();
            const response = await removeUser(currentUser.token, user.data.uid, user.id)
            await getUsers();
            setState({ loading: false })
            console.log({ response })
            toast({
                description: response.data,
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
        }
    }


    return (
        <>
            <Container maxW="container.lg" w={'container.lg'} overflowX="auto" py={4}>
                <Flex mb="1" alignItems={'start'}>
                    <Box>
                        <Heading size="md" whiteSpace={'nowrap'} pl={0}>
                            <Flex alignItems={'center'} gap={3}>
                                <Text>Usuarios</Text>
                            </Flex>
                        </Heading>
                        <Breadcrumb separator="/">
                            <BreadcrumbItem>
                                <NavLink to={`/`}>Inicio</NavLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Text>Usuarios</Text>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </Box>
                    <Spacer />
                    <Navigation />
                </Flex>
                <Box pt={10} mb={8}>
                    <Flex mb='10'>
                        <Box>
                            <Breadcrumb separator='/'>
                                <BreadcrumbItem>
                                    <NavLink to='/admin'>Inicio</NavLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <Text>Usuarios</Text>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </Box>

                        <Spacer />
                    </Flex>
                </Box>
                <Box position={'relative'} mb={10}>
                    {loading && <Flex
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
                    {currentUser && currentUser?.role === ROLES.Admin && (
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Nombre</Th>
                                    <Th>Email</Th>
                                    <Th>Roles</Th>
                                    <Th>Empresa</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {users.map(user => (
                                    <Tr key={user.id}>
                                        <Td py={1.5} px={1.5}>
                                            <Flex alignItems={'center'}>
                                                {user?.data?.photoUrl && <Image borderRadius='full' boxSize='35px' src={user?.data?.photoUrl} mt="0" />}
                                                <Text ml={3}>{user.data?.name}</Text>
                                            </Flex>
                                        </Td>
                                        <Td>
                                            {user.data?.email}
                                        </Td>
                                        <Td px={1.5} py={0.5} >
                                            <Select
                                                h={'30px'}
                                                name="role"
                                                value={user.data?.role}
                                                onChange={(e) => handleRole(e, user)}
                                                disabled={user.data?.role === ROLES.Admin && currentUser?.uid === user.id}
                                            >
                                                <option value={ROLES.Admin}>Admin</option>
                                                <option value={ROLES.Client}>Client</option>
                                                <option value={ROLES.Unauthorized}>Unauthorized</option>
                                            </Select>
                                        </Td>
                                        <Td py={1.5} px={1.5}>
                                            <Button
                                                h={'30px'} mr={2} variant="outline"
                                                colorScheme='red'
                                                onClick={() => {
                                                    setIsOpen(true);
                                                    setUser(user);
                                                }}>
                                                Eliminar
                                            </Button>

                                            <Button
                                                onClick={() => navigate(`/admin/users/${user.id}`, { replace: true })}
                                                mr={5}
                                                h={'30px'}
                                                variant="outline"
                                            >
                                                Ver detalles
                                            </Button>
                                        </Td>

                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )
                    }
                </Box>
                <AlertDialog
                    isOpen={isOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onClose}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                Eliminar Usuario
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                ¿Estás seguro? No podrás deshacer esta acción posteriormente.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button colorScheme='red' onClick={handleDeleteUser} ml={3}>
                                    Eliminar
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </Container>
        </>
    );
};

export default Users;
