import { Box, Container, Heading, Image, Text } from '@chakra-ui/react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Navlnk from '../components/NavLnk';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.png';

const Unauthorized: React.FC = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation();

    const logoutFn = async (e: React.ChangeEvent<unknown>) => {
        e.preventDefault()
        await logout()
        navigate('/login', { replace: true, state: { from: location } })
    }

    return (
        <Box mb={16} h={'70vh'}>
            <Container centerContent maxWidth={'440px'} w={'100%'} h={'100%'} >
                <Card mx='auto' my={'auto'} >

                    <Container centerContent pt={'10px'} pb={'30px'} >
                        <Image src={Logo} minW="180px" />
                    </Container>

                    <Container centerContent pt={'10px'} pb={'30px'} >
                        <Heading as="h2" size="lg" textAlign={'center'}>
                            No estás autorizado para ver esta página.
                        </Heading>
                        <Text textAlign={'center'} pt={5}>Por favor, contacta a un administrador de UML RentCar para que te permitan usar este contenido</Text>
                        <Navlnk to='/logout' name='Salir' py="10" m="0" maxH="18px"
                            onClick={logoutFn}
                        />
                    </Container>
                </Card>
            </Container>
        </Box>
    );
};

export default Unauthorized;
