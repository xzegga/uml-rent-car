import { Flex, Box, Divider, useColorModeValue, Text } from '@chakra-ui/react';
import React from 'react';

interface DividerWithTextProps {
    [key: string]: any;
}

const DividerWithText: React.FC<DividerWithTextProps> = ({ ...props }) => {
    const { children, ...flexProps } = props
    return (
        <Flex align='center' color='gray.300' {...flexProps}>
            <Box flex='1'>
                <Divider borderColor='currentcolor' />
            </Box>
            <Text
                as='span'
                px='3'
                color={useColorModeValue('gray.600', 'gray.400')}
                fontWeight='medium'
            >
                {children}
            </Text>
            <Box flex='1'>
                <Divider borderColor='currentcolor' />
            </Box>
        </Flex>
    );
};

export default DividerWithText;
