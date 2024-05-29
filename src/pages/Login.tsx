import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, chakra, Container, FormControl, FormLabel, HStack, Input, Stack, useToast, Image, Flex } from '@chakra-ui/react'
import { FaGoogle } from 'react-icons/fa';

import DividerWithText from '../components/DividerWithText';
import Card from '../components/Card';
import useMounted from '../hooks/useMounted';
import Loading from '../components/Loading';
import { useStore } from '../hooks/useGlobalStore';
import Logo from '../assets/logo.png';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast()
    const mounted = useMounted()

    const { signInWithGoogle, login } = useAuth()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const { currentUser } = useStore();

    useEffect(() => {
        goToPage();
    }, [])


    useEffect(() => {
        goToPage();
    }, [currentUser])

    const goToPage = () => {
        if (currentUser?.uid && currentUser?.role) {
            navigate(`/`, { replace: false })
        }
    }

    const submit = async (e: any) => {
        e.preventDefault()
        if (!email || !password) {
            return
        }

        setIsSubmitting(true)
        login(email, password)
            .catch(() => errorToast())
            .finally(() => {
                mounted.current && setIsSubmitting(false)
            })
    }

    const loginWithGoogle = () => {
        signInWithGoogle()
            .finally(() => {
                mounted.current && setIsSubmitting(false)
            });
    }

    const errorToast = () => {
        toast({
            description: "Nombre de usuario o contraseña incorrectos, por favor verifica e intenta nuevamente.",
            status: 'error',
            duration: 9000,
            isClosable: true,
        })
    }

    return (
        <>
            {
                isSubmitting ? (
                    <Loading />
                ) : !currentUser.uid ? (
                    <Box mb={16} h={'80vh'}>
                        <Container centerContent maxWidth={'440px'} w={'100%'} h={'100%'} >
                            <Card mx='auto' my={'auto'} >

                                <Container centerContent pt={'10px'} pb={'60px'} >
                                    <Image src={Logo} minW="188px" />
                                </Container>

                                <chakra.form
                                    onSubmit={submit}
                                >
                                    <Stack spacing='6'>
                                        <FormControl id='email'>
                                            <HStack>
                                                <FormLabel minW={85}>Email</FormLabel>
                                                <Input
                                                    name='email'
                                                    type='email'
                                                    autoComplete='email'
                                                    required
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    w={210}

                                                />
                                            </HStack>
                                        </FormControl>
                                        <FormControl id='password'  minW={85}>
                                            <HStack>
                                                <FormLabel>Contraseña</FormLabel>
                                                <Input
                                                    name='password'
                                                    type='password'
                                                    autoComplete='password'
                                                    value={password}
                                                    required
                                                    onChange={e => setPassword(e.target.value)}
                                                    w={210}
                                                />
                                            </HStack>
                                        </FormControl>
                                        <Button
                                            type='submit'
                                            colorScheme='blue'
                                            bg='blue.700'
                                            size='lg'
                                            fontSize='md'
                                            isLoading={isSubmitting}                                            
                                        >
                                            Ingresar
                                        </Button>
                                    </Stack>
                                </chakra.form>
                                <Flex my={4} justifyContent={'space-between'}>
                                    <Button variant='link'>
                                        <Link to='/forgot-password'>¿Olvidó su contraseña?</Link>
                                    </Button>
                                    <Button variant='link' onClick={() => navigate('/register')}>
                                        Registrarse
                                    </Button>
                                </Flex>
                                <DividerWithText my={6}>ó</DividerWithText>
                                <Button
                                    variant='outline'
                                    width='100%'
                                    colorScheme='red'
                                    leftIcon={<FaGoogle />}
                                    onClick={loginWithGoogle}
                                >
                                    Ingresar con Google
                                </Button>
                            </Card>
                        </Container>
                    </Box>
                ) : (<>

                </>)
            }
        </>)
};

export default Login;
