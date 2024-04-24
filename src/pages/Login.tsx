import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, chakra, Container, FormControl, FormLabel, HStack, Input, Stack, useToast, Image } from '@chakra-ui/react'
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

    const goToPage = ()=>{
        if (currentUser?.uid && currentUser?.role) {
            navigate(`/${currentUser?.role}/`, { replace: false })
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

                                <Container centerContent pt={'10px'} pb={'30px'} >
                                    <Image src={Logo} minW="300px" />
                                </Container>

                                <chakra.form
                                    onSubmit={submit}
                                >
                                    <Stack spacing='6'>
                                        <FormControl id='email'>
                                            <FormLabel>Correo electrónico</FormLabel>
                                            <Input
                                                name='email'
                                                type='email'
                                                autoComplete='email'
                                                required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl id='password'>
                                            <FormLabel>Contraseña</FormLabel>
                                            <Input
                                                name='password'
                                                type='password'
                                                autoComplete='password'
                                                value={password}
                                                required
                                                onChange={e => setPassword(e.target.value)}
                                            />
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
                                <HStack justifyContent='space-between' my={4}>
                                    <Button variant='link'>
                                        <Link to='/forgot-password'>¿Olvidó su contraseña?</Link>
                                    </Button>
                                    <Button variant='link' onClick={() => navigate('/register')}>
                                        Registrarse
                                    </Button>
                                </HStack>
                                <DividerWithText my={6}>OR</DividerWithText>
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
