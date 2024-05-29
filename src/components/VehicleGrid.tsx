import React, { useEffect } from 'react';
import { Grid, GridItem, Box, Text, Flex, Image, Tag, Button } from '@chakra-ui/react';
import { VehicleObject } from '../models/Vehicles';
import { getDocuments } from '../data/Documents';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useGlobalStore';

interface VehicleProps {
    vehicles: VehicleObject[];
}

const VehicleGrid: React.FC<VehicleProps> = ({ vehicles }) => {
    const [images, setImages] = React.useState<any[]>([]);
    const navigate = useNavigate();
    const { currentUser } = useStore();

    useEffect(() => {
        getImage(vehicles);
    }, [vehicles]);

    const getImage = async (vehicles: VehicleObject[]) => {
        for (const vehicle of vehicles) {
            const result = await getDocuments(vehicle.id);
            if (result) {
                setImages((prev) => [...prev, { id: vehicle.id, image: result[0] }]);
            }
        }
    }

    const getImageById = (id: string) => {
        const image = images.find((image) => image.id === id);
        return image?.image;
    }

    return (<>

        <Grid templateColumns="repeat(auto-fit, minmax(450px, 1fr))" gap={3}>
            {vehicles.map((vehicle) => (
                <GridItem key={vehicle.id}>
                    <Box p={4} shadow="md" borderWidth="1px">
                        <Flex gap={3}>
                            <Box>
                                {images.length && getImageById(vehicle.id) ? (
                                    <Image
                                        borderRadius="lg"
                                        boxSize="200px"
                                        src={getImageById(vehicle.id)}
                                        alt={`${vehicle.data.brand} ${vehicle.data.model}`}
                                        loading='lazy'
                                    />
                                ) : null}
                            </Box>
                            <Box textAlign={'left'} flex={'auto'}>
                                <Flex justifyContent={'flex-end'} width={'100%'}>
                                    {vehicle.data.available ? <Tag size={'sm'} variant='solid' colorScheme='blue'>
                                        Disponible
                                    </Tag> : <Tag size={'sm'} variant='solid' colorScheme='red'>
                                        No Disponible
                                    </Tag>}
                                </Flex>

                                <Text fontWeight="bold" fontSize={16} mb={3}>{vehicle.data.brand} {vehicle.data.model}</Text>

                                <Flex mb={1}>
                                    <Text fontWeight={'bold'} width={'110px'} mb={1}>Año</Text>
                                    <Text>{vehicle.data.year}</Text>
                                </Flex>
                                <Flex mb={1}>
                                    <Text fontWeight={'bold'} width={'110px'} mb={1}>Tipo</Text>
                                    <Text>{vehicle.data.type}</Text>
                                </Flex>
                                <Flex mb={1}>
                                    <Text fontWeight={'bold'} width={'110px'} mb={1}>Kilometraje</Text>
                                    <Text>{vehicle.data.milleage}</Text>
                                </Flex>
                                <Flex justifyContent={'flex-end'}>

                                    <Button
                                        colorScheme="green" size="sm" mt={3}
                                        onClick={() => {
                                            navigate(`/${currentUser.role}/rentals/add/${vehicle.id}`);
                                        }}
                                        cursor={'pointer'}
                                        _hover={{ bg: 'gray.100' }}
                                    >
                                        Rentar Vehículo
                                    </Button>
                                </Flex>
                            </Box>
                        </Flex>



                    </Box>
                </GridItem>
            ))}
        </Grid>
    </>
    );
};

export default VehicleGrid;