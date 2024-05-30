import {
    Container, Flex, Heading, Breadcrumb, BreadcrumbItem, Spacer,
    Box, Text,
    FormControl, FormLabel, InputGroup, VStack,
    Input,
    Textarea,
    Button,
    useToast,
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
} from "@chakra-ui/react";
import { RibbonContainer, Ribbon } from "react-ribbons";
import { NavLink } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useStore } from "../../hooks/useGlobalStore";
import { useEffect, useState } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import { useAuth } from "../../context/AuthContext";
import useHandleFormControls from "../../hooks/handleFormControls";
import { Approver, User } from "../../models/Users";

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../shared/AddReservation.css';
import { addApprover, findUserByEmail, getUserNamesById, saveUserById, updateUserApproverById } from "../../data/users";
import { CheckIcon, TimeIcon } from "@chakra-ui/icons";
import { FaUserAlt } from "react-icons/fa";


export type DebounceFunc<T extends unknown[]> = (...args: T) => void;

export default function Profile() {

    const { currentUser, setState } = useStore();
    const [user, setUser] = useState<User>({ ...currentUser });
    const [saving, setSaving] = useStateWithCallbackLazy<boolean>(false);
    const { validate } = useAuth();
    const toast = useToast();
    const [approver, setApprover] = useState<string>('');

    const [recommended, setReccommended] = useState<any[]>([]);

    const {
        handleDate,
        handleTextArea,
        handleInput
    } = useHandleFormControls(user, setUser);

    const saveRequest = async (usr: User) => {
        if (currentUser) {
            await validate();
            setSaving(true, () => console.log);
            await saveUserById(usr);

            setState({ currentUser: usr })
            setSaving(false, () => console.log);

            toast({
                title: 'Perfil Actualizado',
                description: 'Su perfil se ha actualziado con exito',
                status: 'success',
                duration: 9000,
                isClosable: true
            });
        }
    };

    const getUsersToRecomend = async () => {
        if (Array.isArray(user.approvals) && user.approvals.length > 0) {
            const rec = [];

            for (const approver of user.approvals) {
                if (approver.status === 'aprovado' || approver.status === 'rechazado') continue;
                const userData = await getUserNamesById(approver.uid);
                rec.push({ ...userData, status: approver.status });
            }

            setReccommended(rec);
        }
    }

    useEffect(() => {
        if (currentUser) {
            getUsersToRecomend();
        }
    }, [user]);

    const approveUser = async (uid: string) => {
        const usr: User = {
            ...user, approvals: user.approvals.map((apr) => {
                if (apr.uid === uid) {
                    return { uid, status: 'aprovado' }
                }
                return apr;
            })
        };

        // Saving my profile
        await saveRequest(usr);

        setSaving(true, () => console.log);
        // Saving the recommended user
        await updateUserApproverById(uid, user.uid);

        setState({ currentUser: usr });
        setUser(usr);

        setSaving(false, () => console.log);
        toast({
            title: `Usuario Aprobado`,
            description: `${recommended.find((r) => r.uid === uid)?.name || 'Usuario'} aprobado con exito`,
            status: 'success',
            duration: 9000,
            isClosable: true
        });
    }


    const askRecommendation = async (email: string) => {
        if (email === '') return;

        setSaving(true, () => console.log);
        const userByEmail = await findUserByEmail(email);
        if (userByEmail.uid) {
            const appr: Approver = {
                uid: user.uid,
                status: 'pendiente'
            };
            try {
                await addApprover(userByEmail.uid, appr);
                setSaving(false, () => console.log);
                toast({
                    title: `Solicitud Enviada`,
                    description: `Se ha enviado una solicitud de aprovación a ${email}`,
                    status: 'success',
                    duration: 9000,
                    isClosable: true
                });

            } catch (error) {
                console.error('Error asking for recommendation:', error);
            }
        }
    }


    return (
        <Container maxW="container.lg" w={'container.lg'} overflowX="auto" py={4}>
            <Flex mb="1" alignItems={'start'}>
                <Box>
                    <Heading size="md" whiteSpace={'nowrap'} pl={0}>
                        <Flex alignItems={'center'} gap={3}>
                            <Text>Autos Rentados</Text>
                        </Flex>
                    </Heading>
                    <Breadcrumb separator="/">
                        <BreadcrumbItem>
                            <NavLink to={`/`}>Inicio</NavLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Text>Mi Perfil</Text>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </Box>
                <Spacer />
                <Navigation />
            </Flex>

            <Box width={'100%'} pt={10}>
                {
                    recommended?.length ? (
                        <Alert status='warning' borderRadius={'md'} m={0} color={'orange.900'} textAlign={'left'} alignItems={'start'}>
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Las siguiente personas han solicitado tu recomendación para poder utilizar el sistema</AlertTitle>
                                <AlertDescription>
                                    <VStack pt={5} alignItems={'start'}>
                                        {
                                            recommended.map(({ uid, status, name }) =>
                                                <Flex alignItems={'center'} key={uid}>
                                                    <Flex alignItems={'center'} minW={200}>

                                                        <FaUserAlt />
                                                        <Text ml={2} mr={'100px'}>{name}</Text>

                                                        <Text fontSize={'small'}>
                                                            <TimeIcon mr={2} />
                                                            {status.toUpperCase()}
                                                        </Text>
                                                    </Flex>
                                                    <Button ml={4} colorScheme={'green'} size={'xs'} onClick={() => approveUser(uid)}>
                                                        Aprobar <CheckIcon ml={2} />
                                                    </Button>
                                                </Flex>
                                            )
                                        }
                                    </VStack>
                                </AlertDescription>
                            </Box>
                        </Alert>) : null
                }

                <RibbonContainer>
                    <Ribbon
                        side="right"
                        type="edge"
                        size="large"
                        backgroundColor={user?.approver ? '#00cc00' : '#c6004e'}
                        color="#ffffff"
                        fontFamily="sans-serif"
                        withStripes={true}
                    >
                        {user?.approver ? 'Aprobado' : 'Pendiente'}
                    </Ribbon>
                    <Flex borderRadius="lg" mt="10" className={saving ? 'blured' : ''} alignItems={'center'} >
                        <Box flex={2} borderRadius="lg" bg="blue.700" color="white" p={5}>
                            <Spacer />
                            <Flex>
                                <VStack spacing={5} mr={3} flexGrow={1} flexShrink={1} flexBasis={'50%'} p={2} pt={5}>
                                    <Flex w={'100%'} justifyContent={'start'} gap={5}>
                                        <FormControl id="language_requested">
                                            <FormLabel>Email/User</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input disabled name="email" id="email" value={user.email} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>
                                    </Flex>
                                    <Flex w={'100%'} justifyContent={'start'} gap={5}>
                                        <FormControl id="language_requested">
                                            <FormLabel>Nombre Completo</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="Placa" name="name" id="name" value={user.name} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>
                                    </Flex>
                                    <FormControl id="additional_information">
                                        <FormLabel>Dirección</FormLabel>
                                        <Textarea
                                            name="additionalInfo"
                                            id="additionalInfo"
                                            value={user.address}
                                            onChange={(e) => handleTextArea(e, 'address')}
                                            borderColor="gray.300"
                                            _hover={{
                                                borderRadius: 'gray.300'
                                            }}
                                            placeholder="Dirección"
                                        />
                                    </FormControl>

                                </VStack>
                                <VStack spacing={5} mr={3} flexGrow={1} flexShrink={1} flexBasis={'50%'} p={2} pt={5}>
                                    <Flex w={'100%'} justifyContent={'start'} gap={5}>
                                        <FormControl id="language_requested">
                                            <FormLabel>DUI</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="DUI" name="dui" id="dui"
                                                    value={user.dui}
                                                    onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>
                                    </Flex>
                                    <Flex w={'100%'} justifyContent={'start'} gap={5}>
                                        <FormControl id="language_requested">
                                            <FormLabel>NIT</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="NIT" name="nit" id="nit" value={user.nit} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>
                                    </Flex>
                                    <Flex w={'100%'} h={'100%'}>
                                        <FormControl id="birthday">
                                            <FormLabel>Fecha de Nacimiento</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Box color={'black'}>
                                                    <DatePicker
                                                        selected={user?.birthday?.toDate() || new Date()}
                                                        onChange={(date) => {
                                                            handleDate(date || new Date(), 'birthday')
                                                        }}
                                                        locale="pt-BR"
                                                        timeFormat="p"
                                                        timeIntervals={30}
                                                        dateFormat="Pp"
                                                        calendarClassName={'calendar-date'}
                                                    />
                                                </Box>
                                            </InputGroup>
                                        </FormControl>
                                        <FormControl textAlign={'right'} alignSelf={'end'}>
                                            <Button
                                                colorScheme={'green'}
                                                onClick={() => saveRequest(user)}
                                            >
                                                Guardar
                                            </Button>
                                        </FormControl>
                                    </Flex>
                                </VStack>
                            </Flex>
                            <Spacer />
                            <Box p={1} pt={5} >
                                <Spacer />
                                <Flex w={'100%'} justifyContent={'start'} gap={5} borderTop={'1px'} borderColor={'gray.50'} pt={5}>
                                    <FormControl id="approvals" maxW={'48%'}>
                                        <FormLabel>Pedir recomendación</FormLabel>
                                        <InputGroup borderColor="#E0E1E7">
                                            <Input placeholder="Correo electrónico" name="approver" id="approver"
                                                value={approver}
                                                onChange={(e) => {
                                                    setApprover(e.target.value);
                                                }} />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl alignSelf={'end'} textAlign={'left'}>
                                        <Button
                                            colorScheme={'white'}
                                            variant={'outline'}
                                            disabled={!approver}
                                            onClick={() => askRecommendation(approver!)}
                                        >
                                            Solicitar
                                        </Button>
                                    </FormControl>
                                </Flex>
                            </Box>
                        </Box>

                    </Flex>
                </RibbonContainer>
            </Box>
        </Container >
    );
}