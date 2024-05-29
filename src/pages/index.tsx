import { useEffect } from "react";
import { getAllVehicles } from "../data/Vehicles";
import VehicleGrid from "../components/VehicleGrid";
import { Container, Flex, Heading, Spacer, Text, Box } from "@chakra-ui/react";
import Navigation from "../components/Navigation";
import { RepeatIcon } from "@chakra-ui/icons";
import { useStore } from "../hooks/useGlobalStore";

export default function Home() {
  const { vehicles, setState } = useStore();

  useEffect(() => {
    getQuery();
  }, []);

  const getQuery = async () => {
    if (vehicles.length !== 0) return;

    fetchData();
  }

  const fetchData = async () => {
    const vcl = await getAllVehicles({});
    setState({vehicles: vcl})
  }

  return (
    <Container maxW="container.lg" w={'container.lg'} overflowX="auto" py={4}>
      <Flex mb="1" alignItems={'start'}>
        <Box>
          <Heading size="md" whiteSpace={'nowrap'} pl={0}>
            <Flex alignItems={'center'} gap={3}>
              <Text>Vehiculos Disponibles</Text>
            </Flex>
          </Heading>
        </Box>
        <Spacer />
        <Navigation />
      </Flex>
      {vehicles?.length ? (
        <Box pt={10}>
          <Box mb={2} textAlign={'right'}><RepeatIcon onClick={fetchData} color="gray.500" fontSize={22} cursor={'pointer'} /></Box>
          <VehicleGrid vehicles={vehicles} />
        </Box>
      ) : null}
    </Container>
  )
}