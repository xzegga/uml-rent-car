import { Timestamp } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import {
    Box, Checkbox, Flex, IconButton, LinkBox, Td, Tr,
    useToast, Image,
    VStack
} from '@chakra-ui/react';

import { useStore } from '../../hooks/useGlobalStore';
import { transfromTimestamp } from '../../utils/helpers';
import Status from '../Status';
import { ReservationObject } from '../../models/Reservation';
import { getDocuments } from '../../data/Documents';
import { getVehicleById } from '../../data/Vehicles';
import { getUserDataById } from '../../data/users';

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
    const { selectedIds, setState, currentUser } = useStore();
    const toast = useToast()
    const [metaData, setMetadata] = React.useState<any>();

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

    useEffect(() => {
        getVehicleData();
    }, []);

    const getVehicleData = async () => {
        const result = await getDocuments(reservation.data.vehicleId);
        const vehicle = await getVehicleById(reservation.data.vehicleId);
        const user = await getUserDataById(reservation.data.userId);
        const metaData = {
            id: reservation.id,
            data: vehicle.data,
            image: result?.length ? result[0] : '',
            user: user.data,
        }
        console.log({ metaData });
        setMetadata(metaData);
    };

    const handleGoToReservation = (id: string) => {
        navigate(`/${currentUser.role}/rentals/${id}`);
    }

    return (

        <Tr cursor={'pointer'} _hover={{ bg: 'gray.100' }} style={reservation.data.status === 'Archived' ? stripped : {}}>
            {currentUser.role === 'admin' && (
            <Td px={0} pl={1}>
                <Checkbox isChecked={selectedIds.includes(reservation.id)} onChange={(e) => handleSelected(e, reservation.id)}></Checkbox>
            </Td>) }
            <Td px={2}>
                {metaData?.image !== '' ? (
                    <Image
                        borderRadius="lg"
                        width="65px"
                        src={metaData?.image}
                        loading='lazy'
                    />
                ) : null}
            </Td>
            <LinkBox
                as={Td}
                py={1.5} px={1.5}
                onClick={() => handleGoToReservation(reservation.id)}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Flex alignItems={'center'}>
                    <VStack alignItems={'flex-start'}>
                        <Box>{metaData?.user?.email}</Box>
                        <Box>Fecha: {reservation.data.startDate && convertTimeStamp(reservation.data.startDate)}</Box>
                    </VStack>
                </Flex>
            </LinkBox>
            <LinkBox
                as={Td}
                py={1.5} px={1.5}
                onClick={() => handleGoToReservation(reservation.id)}
                cursor={'pointer'}
                _hover={{ bg: 'gray.100' }}
            >
                <Flex alignItems={'center'}>
                    {metaData?.data?.brand} {metaData?.data?.model} {metaData?.data?.year}
                </Flex>
            </LinkBox>
            <LinkBox
                py={1.5} px={1.5}
                as={Td}
                onClick={() => handleGoToReservation(reservation.id)}
                cursor={'pointer'}
                style={{ whiteSpace: 'nowrap' }}
                _hover={{ bg: 'gray.100' }}
            >
                {reservation.data.startDate && convertTimeStamp(reservation.data.startDate)}
            </LinkBox>
            <LinkBox
                py={1.5} px={1.5}
                as={Td}
                onClick={() => handleGoToReservation(reservation.id)}
                cursor={'pointer'}
                style={{ whiteSpace: 'nowrap' }}
                _hover={{ bg: 'gray.100' }}
            >
                {reservation.data.endDate && convertTimeStamp(reservation.data.endDate)}
            </LinkBox>
            <LinkBox
                as={Td}
                py={1.5} px={1.5}
                onClick={() => handleGoToReservation(reservation.id)}
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
