import {
    /* Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Chip, Typography, Avatar, */
    Box, Divider,
    /* Tabs, Tab,
    Card, CardMedia, Stack */
} from "@mui/material";
import parse from 'html-react-parser';
import React from 'react';

import { H1 } from "../../../components/Typography";

const ProductInfo = ({ data }) => {

    return (
        <div>
            {
                data &&
                <Box sx={{
                    padding: "0 16px"
                }}>
                    <Divider />
                    <H1 sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: "16px 0 0"
                    }}
                    >{data.header}</H1>
                    <Box
                        sx={{
                            padding: "0 24px"
                        }}
                    > {parse(`${data.content}`)}
                    </Box>

                    {/* Lượt thích, bình luận */}
                </Box>

            }
        </div>
    );
};

export default ProductInfo;
