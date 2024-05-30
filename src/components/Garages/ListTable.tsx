import React from 'react';
import { Box, Center, Flex, Spinner, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useStore } from '../../hooks/useGlobalStore';
import Row from './Row';

interface ListTableProps {
    rows: any[];
    removeRow: (row: any) => void;
}

const ListTable: React.FC<ListTableProps> = ({ rows, removeRow }) => {
    const { loading, loadingMore } = useStore()

    return (
        <Box position={'relative'}>
            {!loading || loadingMore ? <>
                {loadingMore && <Flex
                    h={'100%'}
                    style={{
                        position: 'absolute',
                        left: 0, right: 0, top: 0, bottom: 0,
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        zIndex: 10
                    }}
                    position={'absolute'}
                    alignItems={'center'}
                ><Spinner size='xl' mx={'auto'} /></Flex>}
                {rows.length ?
                    <Table variant='simple' mt='5'>
                        <Thead>
                            <Tr>
                                <Th px={1}>Nombre</Th>
                                <Th px={1}>Dirección</Th>
                                <Th px={1}>Vehículo Asignado</Th>
                                <Th maxW={20}></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((item: any) => (
                                <Row
                                    key={item.id}
                                    row={item}
                                    removeRow={removeRow} />
                            ))}
                            {rows.length === 0 ? <Tr><Td colSpan={6}>
                                <Center>Reserva no encontrada</Center>
                            </Td></Tr> : null}
                        </Tbody>
                    </Table >
                    : null}
            </> :
                <Flex h={'500px'} justifyContent={'center'} alignItems={'center'}><Spinner size='xl' /></Flex>
            }

        </Box>
    );
};

export default ListTable;
