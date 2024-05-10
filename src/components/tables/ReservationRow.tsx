import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import {
    Box, Checkbox, Flex, IconButton, Link, LinkBox, Td, Text, Tr,
    useToast
} from '@chakra-ui/react';

import { useStore } from '../../hooks/useGlobalStore';
import { transfromTimestamp } from '../../utils/helpers';
import Status from '../Status';
import { ReservationObject } from '../../models/Reservation';

interface ReservationRowProps {
    reservation: ReservationObject;
    removeReservation: (reservation: ReservationObject) => void;
}

const stripped = {
    backgroundImage: 'linear-gradient(130deg, #faf9f0 44.44%, #fffceb 44.44%, #fffceb 50%, #faf9f0 50%, #faf9f0 94.44%, #fffceb 94.44%, #fffceb 100%)',
    backgroundSize: '58.74px 70.01px'
};

const ReservationRow: React.FC<ReservationRowProps> = ({ reservation, removeReservation }) => {
    const navigate = useNavigate();
    const { selectedIds, setState } = useStore();
    const toast = useToast()

    const convertTimeStamp = (time: any) => {
        const timeStamp = new Timestamp(time._seconds, time._nanoseconds);
        return transfromTimestamp(timeStamp)
    }

    const handleSelected = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const target = e.target as HTMLInputElement;
        const isChecked = target.checked;

        // Assuming your array is stored in a state variable called 'ids'
        const index = selectedIds.indexOf(id);

        if (isChecked && index === -1) {
            if (selectedIds.length < 30) {
                // If the checkbox is checked and the id doesn't exist in the array, add it
                setState({ selectedIds: [...selectedIds, id] });
            } else {
                toast({
                    description: `Solamente 30 reservaciones pueden cambiar su estado al mismo tiempo.`,
                    status: 'warning',
                    duration: 9000,
                    isClosable: true,
                })
            }

        } else if (!isChecked && index !== -1) {
            // If the checkbox is unchecked and the id exists in the array, remove it
            const updatedIds = selectedIds.filter(item => item !== id);
            setState({ selectedIds: updatedIds });
        }
    }

    return (

        <Tr cursor={'pointer'} _hover={{ bg: 'gray.100' }} style={reservation.data.status === 'Archived' ? stripped : {}}>
            <Td px={0} pl={1}>
                <Checkbox isChecked={selectedIds.includes(reservation.id)} onChange={(e) => handleSelected(e, reservation.id)}></Checkbox>
            </Td>
            <LinkBox
                as={Td}
                py={1.5} px={1.5}
                onClick={() => {
                    navigate(`project/${reservation.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Link color={'blue.400'}>
                    <Text whiteSpace={'nowrap'}>{reservation?.data?.reservationId}</Text>
                </Link>
            </LinkBox>
            <LinkBox
                as={Td}
                py={1.5} px={1.5}
                onClick={() => {
                    navigate(`project/${reservation.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Flex alignItems={'center'}>
                    {reservation?.data?.clientID}
                </Flex>
            </LinkBox>
            <LinkBox
                as={Td}
                py={1.5} px={1.5}
                onClick={() => {
                    navigate(`project/${reservation.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Flex alignItems={'center'}>
                    {reservation?.data?.vehicleID}
                </Flex>
            </LinkBox>
            <LinkBox
                py={1.5} px={1.5}
                as={Td}
                onClick={() => {
                    navigate(`project/${reservation.id}`);
                }}
                cursor={'pointer'}
                style={{ whiteSpace: 'nowrap' }}
                _hover={{ bg: 'gray.100' }}
            >
                {reservation.data.created && convertTimeStamp(reservation.data.startDate)}
            </LinkBox>
            <LinkBox
                py={1.5} px={1.5}
                as={Td}
                onClick={() => {
                    navigate(`project/${reservation.id}`);
                }}
                cursor={'pointer'}
                style={{ whiteSpace: 'nowrap' }}
                _hover={{ bg: 'gray.100' }}
            >
                {reservation.data.created && convertTimeStamp(reservation.data.endDate)}
            </LinkBox>
            <LinkBox
                py={1.5} px={1.5}
                as={Td}
                onClick={() => {
                    navigate(`project/${reservation.id}`);
                }}
                cursor={'pointer'}
                style={{ whiteSpace: 'nowrap' }}
                _hover={{ bg: 'gray.100' }}
            >
                {reservation.data.created && convertTimeStamp(reservation.data.created)}
            </LinkBox>
            <LinkBox
                as={Td}
                py={1.5} px={1.5}
                onClick={() => {
                    navigate(`project/${reservation.id}`);
                }}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                {reservation.data.status && <Status status={reservation.data.status} />}
            </LinkBox>

            <Td maxW={15} p={0}>
                <Flex>

                        <Box maxW={'30%'} w={'30%'}>
                            <IconButton
                                variant="ghost"
                                height={10}
                                icon={<RiDeleteBin6Line color={'#f84141'} />}
                                aria-label="toggle-dark-mode"
                                onClick={() => {
                                    removeReservation(reservation);
                                }}
                                disabled={reservation.data.status !== 'Received'}
                            />
                        </Box>
                </Flex>
            </Td>
        </Tr>

    );
};

export default ReservationRow;
