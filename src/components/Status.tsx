import { Badge, Center } from '@chakra-ui/react';
import React from 'react';

interface StatusProps {
    status: string;
}

const Status: React.FC<StatusProps> = ({ status }) => {

    const color = (status: string) => {
        if (status === 'Recibido') return 'cyan'
        if (status === 'En Progreso') return 'yellow'
        if (status === 'Aprovada') return 'green'
        if (status === 'Completada') return 'green'
        if (status === 'En Espera') return 'red'
    }

    return (
        <Badge w={'100px'} borderRadius={4} colorScheme={color(status)}><Center>{status}</Center></Badge>
    );
};

export default Status;
