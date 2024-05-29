import './AddReservation.css';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

import {
  Box, Breadcrumb, BreadcrumbItem, Button, Image, Container, Flex,
  FormControl, FormLabel, Heading, InputGroup, Select, Spacer, Text,
  VStack,
  AlertIcon,
  Alert,
  AlertTitle,
  AlertDescription,
  Link,
} from '@chakra-ui/react';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { saveReservation } from '../../data/Reservations';
import { useStore } from '../../hooks/useGlobalStore';
import { useAuth } from '../../context/AuthContext';
import { Reservation } from '../../models/Reservation';
import useHandleFormControls from '../../hooks/handleFormControls';
import Navigation from '../../components/Navigation';
import { getDocuments } from '../../data/Documents';
import { updateAvailability } from '../../data/Vehicles';

const initialState: Reservation = {
  vehicleId: '',
  userId: '',
  startDate: Timestamp.now(),
  endDate: Timestamp.now(),
  mileageUsed: 0,
  status: 'Recibido',
  pickupPlace: '',
  created: Timestamp.now(),
};

const AddReservation: React.FC = () => {
  const { id } = useParams();
  const [saving, setSaving] = useStateWithCallbackLazy<boolean>(false);
  const { currentUser, vehicles } = useStore();
  const [vehicle] = useState(vehicles.find((v) => v.id === id));
  const { validate } = useAuth();
  const [metaData, setMetadata] = React.useState<any>();
  const [item, setItem] = useState<Reservation>({
    ...initialState,
    userId: currentUser?.uid,
    vehicleId: id ? id : '',
  });

  const {
    handleDropDown,
    handleDate,
  } = useHandleFormControls(item, setItem);

  const navigate = useNavigate();

  const saveRequest = async () => {
    if (currentUser) {
      await validate();
      setSaving(true, () => console.log);

      const serervationToSave: Reservation = {
        ...item,
      };

      await saveReservation(serervationToSave);
      await updateAvailability(id ? [id] : [], false);
      setSaving(false, () => navigate(`/${currentUser?.role}/rentals`));

    }
  };

  useEffect(() => {
    if (!id) return;
    getVehicleData();
  }, [id]);

  const getVehicleData = async () => {
    if (!id || metaData?.id === id) return;

    const result = await getDocuments(id);
    const mdt = {
      id,
      image: result?.length ? result[0] : '',
    }
    setMetadata(mdt);
  };


  return (
    <>
      {currentUser && (
        <Container maxW="full" mt={0} w={'container.lg'} overflow="hidden" width={'100%'} py={4}>
          <Flex mb="1" alignItems={'start'}>
            <Box>
              <Heading size="md" whiteSpace={'nowrap'} pl={0}>
                <Flex alignItems={'center'} gap={3}>
                  <Text>Reservación</Text>
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
                  <Text>Reservar {vehicle?.data.model}</Text>
                </BreadcrumbItem>
              </Breadcrumb>
            </Box>
            <Spacer />
            <Navigation />
          </Flex>

          <Box width={'100%'} pt={10}>
            <Flex borderRadius="lg" mt="10" className={saving ? 'blured' : ''} alignItems={'center'} >
              <Flex flex={1.2} flexDirection={'column'} justifyContent={'center'} minH={'100%'} cursor={'pointer'}>
                {metaData?.image !== '' ? (
                  <Image
                    borderRadius="lg"
                    width="100%"
                    src={metaData?.image}
                    loading='lazy'
                  />
                ) : null}
              </Flex>
              <Box flex={2} borderRadius="lg" bg="blue.700" color="white" p={5} ml={'-10px'}>
                <Flex pl={2}>

                  <VStack justifyContent={'start'} textAlign={'left'} alignItems={'flex-start'} w={'100%'}>
                    <Heading>{vehicle?.data.brand} {vehicle?.data.model} {vehicle?.data.year}</Heading>
                    <Spacer />
                    <Text>Tipo: {vehicle?.data.type}</Text>
                    <Text>Placa: {vehicle?.data.plate}</Text>
                    {vehicle?.data?.milleage ?
                      <Text>Recorrido: {parseFloat(vehicle?.data?.milleage.toString()).toLocaleString('en-US')} Kms</Text>
                      : null}
                  </VStack>

                </Flex>
                <Spacer />
                {vehicle?.data?.available === false ?
                  <Box my={5}>
                    <Alert status='warning' borderRadius={'md'} color={'orange.900'} textAlign={'left'} alignItems={'start'}>
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Vehículo no disponible!</AlertTitle>
                        <AlertDescription>
                          <VStack pt={2}>
                            <Text>Este vehículo no está disponible por el momento, por favor seleccione otro vehículo.</Text>
                            <Link ml={'auto'} onClick={() => navigate(`/`, { replace: true })} colorScheme={'blue.700'} mr={5}>
                              Volver
                            </Link>
                          </VStack>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </Box> :
                  <Box>
                    <VStack spacing={5} mr={3} flexGrow={1} flexShrink={1} flexBasis={'50%'} p={2} pt={5}>
                      <Flex w={'100%'} justifyContent={'start'} gap={5}>
                        <FormControl id="language_requested" maxW={'210px'}>
                          <FormLabel>Recogida</FormLabel>
                          <InputGroup borderColor="#E0E1E7">
                            <Box color={'black'}>
                              <DatePicker
                                selected={item?.startDate?.toDate()}
                                onChange={(date) => {
                                  handleDate(date || new Date(), 'startDate')
                                }}
                                locale="pt-BR"
                                showTimeSelect
                                timeFormat="p"
                                timeIntervals={30}
                                dateFormat="Pp"
                                calendarClassName={'calendar-times'}
                                minDate={new Date()}
                              />
                            </Box>
                          </InputGroup>
                        </FormControl>

                        <FormControl id="endDate" maxW={'210px'}>
                          <FormLabel>Devolución</FormLabel>
                          <InputGroup borderColor="#E0E1E7">
                            <Box color={'black'}>
                              <DatePicker
                                selected={item?.endDate?.toDate()}
                                onChange={(date) => handleDate(date || new Date(), 'endDate')}
                                locale="pt-BR"
                                showTimeSelect
                                timeFormat="p"
                                timeIntervals={30}
                                dateFormat="Pp"
                                calendarClassName={'calendar-times'}
                                minDate={item?.startDate?.toDate()}
                              />
                            </Box>
                          </InputGroup>
                        </FormControl>
                      </Flex>
                    </VStack>

                    <Flex pl={2} pr={3} pb={5} mt={3} justifyContent={'space-between'} alignItems={'end'}>
                      <FormControl id="department" maxW={'210px'}>
                        <FormLabel>Tipo de Vehículo</FormLabel>
                        <InputGroup borderColor="#E0E1E7">
                          <Select
                            required
                            name="pickupPlace"
                            value={item?.pickupPlace}
                            onChange={handleDropDown}
                            color="black"
                            backgroundColor={'white'}
                            size="md"
                            flex={1}
                          >
                            <option value=''>Seleccione un lugar de recogida</option>
                            <option value='Aeropuerto San Salvador'>Aeropuerto San Salvador</option>
                            <option value='Agencia Nuevo Cuscatlan'>Agencia Nuevo Cuscatlan</option>
                            <option value='Agencia Merliot'>Agencia Merliot</option>
                          </Select>
                        </InputGroup>
                      </FormControl>

                      <FormControl textAlign={'right'}>
                        <Button
                          colorScheme={'green'}
                          onClick={saveRequest}
                          disabled={!vehicle?.data?.available}
                        >
                          Reservar
                        </Button>
                      </FormControl>
                    </Flex>
                  </Box>}

              </Box>

            </Flex>
          </Box>
        </Container>
      )}
    </>
  );
};

export default AddReservation;
