import {
    Button,
    Center,
    chakra,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useToast,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import DividerWithText from '../components/DividerWithText'
import { useAuth } from '../context/AuthContext'


const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate()
    const { forgotPassword } = useAuth()
    const toast = useToast()

    const [email, setEmail] = useState('')

    return (
        <>
            <Heading textAlign='center' my={12}>
                ¿Olvidó su contraseña?
            </Heading>
            <Card maxW='md' mx='auto' mt={4}>
                <chakra.form
                    onSubmit={async e => {
                        e.preventDefault()
                        // your login logic here
                        try {
                            await forgotPassword(email)
                            toast({
                                description: `An email is sent to ${email} for password reset instructions.`,
                                status: 'success',
                                duration: 9000,
                                isClosable: true,
                            })
                        } catch (error: any) {
                            toast({
                                description: error.message,
                                status: 'error',
                                duration: 9000,
                                isClosable: true,
                            })
                        }
                    }}
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
                        <Button type='submit' colorScheme='blue' size='lg' fontSize='md'>
                            Enviar
                        </Button>
                    </Stack>
                </chakra.form>
                <DividerWithText my={6}>ó</DividerWithText>
                <Center>
                    <Button variant='link' onClick={() => navigate('/login', { replace: true })}>
                        Ingresar
                    </Button>
                </Center>
            </Card>
        </>
    )
}

export default ForgotPasswordPage;