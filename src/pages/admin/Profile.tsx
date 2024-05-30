import {
    Container, Flex, Heading, Breadcrumb, BreadcrumbItem, Spacer,
    Box, Text,
    FormControl, FormLabel, InputGroup, VStack,
    Input,
    Textarea,
} from "@chakra-ui/react";
import { RibbonContainer, Ribbon } from "react-ribbons";
import { NavLink, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useStore } from "../../hooks/useGlobalStore";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useHandleFormControls from "../../hooks/handleFormControls";
import { User } from "../../models/Users";

import "react-datepicker/dist/react-datepicker.css";
import '../shared/AddReservation.css';
import { getUserDataById } from "../../data/users";

export default function ProfileAdm() {
    const { id } = useParams();
    const { currentUser } = useStore();
    const [user, setUser] = useState<User>()
    const { validate } = useAuth();

    useEffect(() => {
        if (!user && id) getUserById(id);
    }, [id]);

    const getUserById = async (id: string) => {
        try {
            validate();
            const usr: any = await getUserDataById(id);
            if (usr) {
                setUser(usr.data as User);
            }
        } catch (error) {
            console.error('Error getting user by id:', error);
        }
    };

    const {
        handleDate,
        handleTextArea,
        handleInput
    } = useHandleFormControls(user, setUser);

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
                    <Flex borderRadius="lg" mt="10" alignItems={'center'} >
                        <Box flex={2} borderRadius="lg" bg="blue.700" color="white" p={5}>
                            <Spacer />
                            <Flex>
                                <VStack spacing={5} mr={3} flexGrow={1} flexShrink={1} flexBasis={'50%'} p={2} pt={5}>
                                    <Flex w={'100%'} justifyContent={'start'} gap={5}>
                                        <FormControl id="language_requested">
                                            <FormLabel>Email/User</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input disabled name="email" readOnly id="email" value={user?.email} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>
                                    </Flex>
                                    <Flex w={'100%'} justifyContent={'start'} gap={5}>
                                        <FormControl id="language_requested">
                                            <FormLabel>Nombre Completo</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="Placa" readOnly name="name" id="name" value={user?.name} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>
                                    </Flex>
                                    <FormControl id="additional_information">
                                        <FormLabel>Dirección</FormLabel>
                                        <Textarea
                                            name="additionalInfo"
                                            id="additionalInfo"
                                            value={user?.address}
                                            borderColor="gray.300"
                                            _hover={{
                                                borderRadius: 'gray.300'
                                            }}
                                            placeholder="Dirección"
                                            readOnly
                                        />
                                    </FormControl>

                                </VStack>
                                <VStack spacing={5} mr={3} flexGrow={1} flexShrink={1} flexBasis={'50%'} p={2} pt={5}>
                                    <Flex w={'100%'} justifyContent={'start'} gap={5}>
                                        <FormControl id="language_requested">
                                            <FormLabel>DUI</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="DUI" name="dui" id="dui"
                                                    value={user?.dui} readOnly/>
                                            </InputGroup>
                                        </FormControl>
                                    </Flex>
                                    <Flex w={'100%'} justifyContent={'start'} gap={5}>
                                        <FormControl id="language_requested">
                                            <FormLabel>NIT</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="NIT" readOnly name="nit" id="nit" value={user?.nit} />
                                            </InputGroup>
                                        </FormControl>
                                    </Flex>
                                    <Flex w={'100%'} h={'100%'}>
                                        <FormControl id="birthday">
                                            <FormLabel>Fecha de Nacimiento</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="NIT" readOnly name="birthday" id="birthday" value={user?.birthday?.toDate().toDateString()}  />
                                            </InputGroup>
                                            
                                        </FormControl>
                                    </Flex>
                                </VStack>
                            </Flex>
                            <Spacer />
                        </Box>

                    </Flex>
                </RibbonContainer>
            </Box>
        </Container >
    );
}