import '../shared/AddReservation.css';

import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

import {
    Box, Breadcrumb, BreadcrumbItem, Button, CircularProgress, Container, Flex, FormControl,
    FormLabel, Heading, Input, InputGroup, Select, Spacer, Text, VStack
} from '@chakra-ui/react';

import DropZone from '../../components/DropZone';
import { useAuth } from '../../context/AuthContext';
import { saveGarage } from '../../data/Garage';
import { getAllVehicles } from '../../data/Vehicles';
import useHandleFormControls from '../../hooks/handleFormControls';
import { useStore } from '../../hooks/useGlobalStore';
import { Doc } from '../../models/Document';
import { Garage } from '../../models/Garaje';
import { VehicleObject } from '../../models/Vehicles';
import Navigation from '../../components/Navigation';

const initialState: Garage = {
    name: '',
    location: '',
    capacity: 0,
    vehicleId: '',
    created: Timestamp.now()
};

const AddGarage: React.FC = () => {
    const [files, setFiles] = useState<Doc[]>([]);
    const [saving, setSaving] = useStateWithCallbackLazy<boolean>(false);
    const [vehicles, setVehicles] = useState<VehicleObject[]>([]);
    const { currentUser } = useStore();
    const { validate } = useAuth();
    const [garage, setGarage] = useState<Garage>({
        ...initialState
    });

    useEffect(() => {
        if (vehicles.length === 0) {
            loadVehicles();
        }
    }, []);

    const {
        handleDropDown,
        handleInput
    } = useHandleFormControls(garage, setGarage);
    const navigate = useNavigate();

    const saveRequest = async () => {
        if (!files) return;

        if (currentUser) {
            await validate();
            setSaving(true, () => console.log);

            await saveGarage(garage);
            setSaving(false, () => navigate(`/${currentUser?.role}/garages`));
        }
    };

    const loadVehicles = async () => {
        const data = await getAllVehicles({});
        if (data) setVehicles(data);
    }

    return (
        <>
            {currentUser && (
                <Container maxW="full" mt={0} w={'container.lg'} overflow="hidden" width={'100%'} py={4}>
                    <Flex mb="1" alignItems={'start'}>
                        <Box>
                            <Heading size="md" whiteSpace={'nowrap'} pl={0}>
                                <Flex alignItems={'center'} gap={3}>
                                    <Text>Garages</Text>
                                </Flex>
                            </Heading>
                            <Breadcrumb separator="/">
                                <BreadcrumbItem>
                                    <NavLink to={`/`}>Inicio</NavLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <NavLink to={`/${currentUser.role}/garages`}>Garages</NavLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <Text>Agregar Nuevo</Text>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </Box>
                        <Spacer />
                        <Navigation />
                    </Flex>

                    <Box position={'relative'} width={'100%'} pt={10}>
                        <Flex border="1px" borderColor="gray.200" borderRadius="lg" mt="10" className={saving ? 'blured' : ''} position={'relative'}>
                            <Flex flex={1} flexDirection={'column'} justifyContent={'center'} minH={'100%'} cursor={'pointer'} m="5">
                                <DropZone setFileList={setFiles} />
                            </Flex>
                            <Box flex={2} borderRadius="lg" bg="blue.700" color="white" p={5}>
                                <Flex pl={2}>
                                    <VStack spacing={5} mr={3} flexGrow={1} flexShrink={1} flexBasis={'50%'}>
                                        <FormControl id="language_requested">
                                            <FormLabel>Nombre</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="Nombre" name="name" id="name" value={garage.name} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl id="language_requested">
                                            <FormLabel>Dirección</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="Dirección" name="location" id="location" value={garage.location} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl id="language_requested">
                                            <FormLabel>Capacidad</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="Capacidad" name="capacity" id="capacity" value={garage.capacity} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl id="department">
                                            <FormLabel>Vehículo</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">

                                                <Select
                                                    required
                                                    name="vehicleId"
                                                    value={garage.vehicleId}
                                                    onChange={handleDropDown}
                                                    color="black"
                                                    backgroundColor={'white'}
                                                    size="md"
                                                    flex={1}
                                                >
                                                    <option value=''>Seleccione</option>
                                                    {vehicles.length > 0 && (
                                                        vehicles.map((vehicle) => (
                                                            <option key={vehicle.id} value={vehicle.id}>{vehicle.data.brand} {vehicle.data.model} {vehicle.data.year} - {vehicle.data.plate}</option>
                                                        ))
                                                    )}
                                                </Select>
                                            </InputGroup>
                                        </FormControl>
                                    </VStack>
                                </Flex>
                                <Flex pt={5} pl={2} pr={3} mt={3} justifyContent={'space-between'} alignItems={'start'}>
                                    <FormControl textAlign={'right'}>
                                        <Button
                                            variant="outline"
                                            color="white"
                                            onClick={saveRequest}>
                                            Guadar Garage
                                        </Button>
                                    </FormControl>
                                </Flex>
                            </Box>

                        </Flex>
                        <Flex
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                pointerEvents: 'none'
                            }}
                            justifyContent={'center'}
                        >
                            {saving && (
                                <Flex alignItems={'center'} justifyContent={'center'} direction={'column'}>
                                    <CircularProgress isIndeterminate mb={2} /> Guardando...
                                </Flex>
                            )}
                        </Flex>
                    </Box>
                </Container>
            )}
        </>
    );
};

export default AddGarage;
