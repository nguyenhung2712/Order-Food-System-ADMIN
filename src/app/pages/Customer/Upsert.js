/* import { useState, useEffect } from "react"; */
import { useParams } from 'react-router-dom';
import React from 'react';

import { Stack } from "@mui/material";
import { Box, styled } from "@mui/system";
import { Breadcrumb } from "../../components";
import InputForm from "./forms/InputForm";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
    },
}));

const CustomerUpsert = () => {
    const { id } = useParams();
    return (
        <Container>
            <Box className="breadcrumb">
                <Breadcrumb routeSegments={[{ name: "Quản lý", path: "/customer/manage" }, { name: id ? "Cập nhật" : "Thêm mới" }]} />
            </Box>

            <Stack spacing={3}>
                {
                    id
                        ? <InputForm
                            id={id}
                        />
                        : <InputForm />
                }
            </Stack>
        </Container>
    );
};

export default CustomerUpsert;
