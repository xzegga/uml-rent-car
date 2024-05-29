import { Flex, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../models/Users";
import { useStore } from "../hooks/useGlobalStore";

export default function Navigation() {

    const navigate = useNavigate();
    const {
        currentUser,
    } = useStore()

    return <Flex>
        {currentUser.role === ROLES.Admin ? <>
            <Link onClick={() => navigate('/', { replace: true })} colorScheme={'blue.700'} mr={5}>
                Inicio
            </Link>

            <Link onClick={() => navigate('/admin/rentals', { replace: true })} colorScheme={'blue.700'} mr={5}>
                Reservas
            </Link>
            
            <Link onClick={() => navigate('/admin/garages', { replace: true })} colorScheme={'blue.700'} mr={5}>
                Garages
            </Link>
            <Link onClick={() => navigate('/admin/vehicles', { replace: true })} colorScheme={'blue.700'}  mr={5}>
                Vehículos
            </Link>
            <Link onClick={() => navigate('/admin/users', { replace: true })} colorScheme={'blue.700'} mr={5}>
                Usuarios
            </Link>
        </> : <>
            <Link onClick={() => navigate('/', { replace: true })} colorScheme={'blue.700'} mr={5}>
                Inicio
            </Link>

            <Link onClick={() => navigate('/client/rentals', { replace: true })} colorScheme={'blue.700'} mr={5}>
                Reservas
            </Link>
            </>
        }
    </Flex>
}