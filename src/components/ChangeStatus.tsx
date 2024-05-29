import { doc, setDoc } from 'firebase/firestore';
import { Dispatch, useRef, useState } from 'react';

import {
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
    AlertDialogOverlay, Button,
    useToast, Select,
    AlertStatus, Text
} from '@chakra-ui/react';

import { getReservationById, updateStatus } from '../data/Reservations';
import { db } from '../utils/init-firebase';
import { statuses } from '../utils/value-objects';
import { useAuth } from '../context/AuthContext';
import { FaArchive } from 'react-icons/fa';
import { ReservationObject } from '../models/Reservation';

export default function ChangeStatusSelector({ reservation, onSuccess, ids, setReservation, button = false }: {
    reservation?: ReservationObject,
    ids?: string[],
    setReservation?: Dispatch<React.SetStateAction<ReservationObject | undefined>>,
    onSuccess?: (status: string) => void,
    button?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false)
    const { validate } = useAuth();
    const onClose = () => setIsOpen(false)
    const cancelRef = useRef(null)
    const [status, setStatus] = useState<string>(ids?.length ? statuses[0] : reservation?.data?.status || '')
    const toast = useToast()

    const handleChangeStatus = (status: string) => {
        if (status !== '') {
            console.log(status)
            setStatus(status)
            setIsOpen(true)
        }
    }

    const changeStatus = async () => {
        if (reservation) {
            await validate();
            const response = await getReservationById(reservation?.id);

            await setDoc(doc(db, 'reservations', reservation.id), {
                ...response.data,
                status: status
            })

            // update project status
            if (setReservation) setReservation({ ...reservation, data: { ...reservation.data, status: status } })

            toast({
                description: `Status for ${reservation.id} has been changed to ${status}`,
                status: 'info',
                duration: 9000,
                isClosable: true,
            })

            setIsOpen(false)
        }

        if (ids?.length && status) {
            await validate();
            const response = await updateStatus(ids, status);
            toast({
                description: response.message,
                status: response.type as AlertStatus,
                duration: 9000,
                isClosable: true,
            })

            setIsOpen(false)
            if (onSuccess) onSuccess(status);
        }
    }

    return <>
        {!button ?
            <Select
                onChange={(e) => handleChangeStatus(e.target.value)}
                maxW={'150px'}
            >
                {ids && <option value="none">Select Status</option>}
                {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </Select> :
            <Button ml={3} leftIcon={<FaArchive />} colorScheme='orange' onClick={() => handleChangeStatus('Archived')}>Archive</Button>
        }
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {reservation ? <Text>Cambiar estado de la reserva</Text> :
                            <Text>Estas a punto de cambiar el estado de la reserva seleccionada</Text>}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Estas seguro de continuar? no se puede deshacer esta acción.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme={'blue'} onClick={changeStatus} ml={3}>
                            Cambiar a {status}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>
}
