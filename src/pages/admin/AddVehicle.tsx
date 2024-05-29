import '../shared/AddReservation.css';

import { Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

import {
    Box, Breadcrumb, BreadcrumbItem, Button, Checkbox, CircularProgress, Container, Flex,
    FormControl, FormLabel, Heading, Input, InputGroup, Select, Spacer, Text,
    VStack
} from '@chakra-ui/react';

import DropZone from '../../components/DropZone';
import { useStore } from '../../hooks/useGlobalStore';
import { useAuth } from '../../context/AuthContext';
import { Vehicle } from '../../models/Vehicles';
import { saveVehicle } from '../../data/Vehicles';
import { Doc } from '../../models/Document';
import useHandleFormControls from '../../hooks/handleFormControls';
import Navigation from '../../components/Navigation';

const initialState: Vehicle = {
    brand: '',
    model: '',
    year: 2024,
    type: '',
    plate: '',
    milleage: 0,
    available: true,
    created: Timestamp.now(),
};

const AddVehicle: React.FC = () => {
    const [files, setFiles] = useState<Doc[]>([]);
    const [saving, setSaving] = useStateWithCallbackLazy<boolean>(false);
    const { currentUser } = useStore();
    const { validate } = useAuth();
    const [vehicle, setVehicle] = useState<Vehicle>({
        ...initialState
    });

    const {
        handleDropDown,
        handleCheckbox,
        handleInput
    } = useHandleFormControls(vehicle, setVehicle);

    const navigate = useNavigate();

    const saveRequest = async () => {
        if (!files) return;

        if (currentUser) {
            await validate();
            setSaving(true, () => console.log);
            const vehicleToSave: Vehicle = {
                ...vehicle,
            };

            await saveVehicle(vehicleToSave, files);
            setSaving(false, () => navigate(`/${currentUser?.role}`));
        }
    };

    return (
        <>
            {currentUser && (
                <Container maxW="full" mt={0} w={'container.lg'} overflow="hidden" width={'100%'} py={4}>
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
                                    <NavLink to={`/${currentUser.role}/vehicles`}>Vehículos</NavLink>
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
                                        <FormControl id="department">
                                            <FormLabel>Tipo de Vehículo</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Select
                                                    required
                                                    name="type"
                                                    value={vehicle.type}
                                                    onChange={handleDropDown}
                                                    color="black"
                                                    backgroundColor={'white'}
                                                    size="md"
                                                    flex={1}
                                                >
                                                    <option value=''>Seleccione</option>
                                                    <option value='Sedan'>Sedan</option>
                                                    <option value='Hatchback'>Hatchback</option>
                                                    <option value='SUV'>SUV</option>
                                                    <option value='Pickup'>Pickup</option>
                                                    <option value='Van'>Van</option>
                                                    <option value='Convertible'>Convertible</option>
                                                    <option value='Coupe'>Coupe</option>
                                                    <option value='Wagon'>Wagon</option>
                                                    <option value='Minivan'>Minivan</option>
                                                </Select>
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl id="department">
                                            <FormLabel>Marca</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Select
                                                    required
                                                    name="brand"
                                                    value={vehicle.brand}
                                                    onChange={handleDropDown}
                                                    color="black"
                                                    backgroundColor={'white'}
                                                    size="md"
                                                    flex={1}
                                                >
                                                    <option value=''>Seleccione</option>
                                                    <option value='Toyota'>Toyota</option>
                                                    <option value='Chevrolet'>Chevrolet</option>
                                                    <option value='Ford'>Ford</option>
                                                    <option value='Nissan'>Nissan</option>
                                                    <option value='Honda'>Honda</option>
                                                    <option value='Hyundai'>Hyundai</option>
                                                    <option value='Kia'>Kia</option>
                                                    <option value='Mazda'>Mazda</option>
                                                    <option value='Volkswagen'>Volkswagen</option>
                                                    <option value='Mercedes Benz'>Mercedes Benz</option>
                                                    <option value='BMW'>BMW</option>
                                                    <option value='Audi'>Audi</option>
                                                    <option value='Jeep'>Jeep</option>
                                                    <option value='Subaru'>Subaru</option>
                                                    <option value='Volvo'>Volvo</option>
                                                    <option value='Land Rover'>Land Rover</option>
                                                    <option value='Porsche'>Porsche</option>
                                                    <option value='Mini'>Mini</option>
                                                    <option value='Jaguar'>Jaguar</option>
                                                    <option value='Fiat'>Fiat</option>
                                                    <option value='Peugeot'>Peugeot</option>
                                                </Select>
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl id="language_requested">
                                            <FormLabel>Modelo</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="Modelo" name="model" id="model" value={vehicle.model} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>
                                    </VStack>
                                    <VStack spacing={5} mr={3} flexGrow={1} flexShrink={1} flexBasis={'50%'}>
                                        <FormControl id="language_requested">
                                            <FormLabel>Año</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="Año" name="year" id="year" value={vehicle.year} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl id="language_requested">
                                            <FormLabel>Placa</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="Placa" name="plate" id="plate" value={vehicle.plate} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl id="language_requested">
                                            <FormLabel>Kilometraje</FormLabel>
                                            <InputGroup borderColor="#E0E1E7">
                                                <Input placeholder="Placa" name="milleage" id="milleage" value={vehicle.milleage} onChange={handleInput} />
                                            </InputGroup>
                                        </FormControl>


                                    </VStack>
                                </Flex>
                                <Flex pt={5} pl={2} pr={3} mt={3} justifyContent={'space-between'} alignItems={'start'}>
                                    <FormControl textAlign={'left'}>
                                        <Checkbox name="available" id="available" checked={vehicle.available} onChange={handleCheckbox}>
                                            Disponible
                                        </Checkbox>
                                    </FormControl>
                                    <FormControl textAlign={'right'}>
                                        <Button
                                            variant="outline"
                                            color="white"
                                            onClick={saveRequest}
                                            disabled={!!files.length}>
                                            Guadar Vehículo
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

export default AddVehicle;
