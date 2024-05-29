import React from 'react';
import {
    useColorModeValue,
    Flex,
    Box,
    HStack,
    Spacer,
    Text,
    Image
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext';
import Navlnk from './NavLnk';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useGlobalStore';
import Logo from '../assets/logo.png';

const NavigationBar: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuth()
    const { currentUser } = useStore();
    const DarkColor = useColorModeValue('gray.100', 'gray.700')


    const navigate = useNavigate()

    const logoutFn = async (e: React.ChangeEvent) => {
        e.preventDefault()
        await logout()
        navigate('/login', { replace: true })
    }
    return (<>
        {location.pathname !== '/login' && location.pathname !== '/register' ? (
            <Box
                borderBottom='2px'
                borderBottomColor={DarkColor}
                mb={4}
                py={4}
            >
                <HStack
                    justifyContent='flex-end'
                    maxW='container.lg'
                    mx='auto'
                    spacing={4}
                    pl={8}
                >
                    <Image src={Logo} maxH="60px" />
                    <Spacer />
                    {currentUser?.uid ? (
                        <Flex align='center' justify='left'>
                            {currentUser && currentUser?.photoURL && <Image borderRadius='full' boxSize='35px' src={currentUser?.photoURL} mt="0" />}
                            <Text mt={0} fontSize="sm" fontWeight="semibold" lineHeight="short" pl="2">
                                {currentUser?.displayName && (<span>{currentUser?.displayName} <br /></span>)}
                                <Navlnk to='/logout' name='Salir' p="0" m="0" maxH="18px"
                                    onClick={logoutFn}
                                />
                            </Text>
                        </Flex>
                    ) :
                        <Flex align='center' justify='left'>
                            <Text mt={0} fontSize="sm" fontWeight="semibold" lineHeight="short" pl="2">
                                <Navlnk to='/login' name='Ingresar' p="0" m="0" maxH="18px" />
                            </Text>
                        </Flex>
                    }

                </HStack>
            </Box>) : null}
    </>

    );
};

export default NavigationBar;
