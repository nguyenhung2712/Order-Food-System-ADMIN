import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from '@fullcalendar/core'
import viLocale from '@fullcalendar/core/locales/vi';
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

import {
    Box, List, ListItem, ListItemText, Typography, useTheme,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    TextField, Button, Autocomplete, Chip, Grid, Backdrop, CircularProgress
} from "@mui/material";
import { LoadingButton } from '@mui/lab';
import ScheduleService from "../../services/schedule.service";
import StaffService from "../../services/staff.service";
import { SimpleCard, Breadcrumb } from "../../components";
import "./Calendar.css";
import Swal from "sweetalert2";
import { deepObjectEqual } from "../../utils/utils";
import { addDocument } from '../../services/firebase/service';

const Calendar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = [
        "#D50000", "#E67C73", "#F4511E",
        "#F6BF26", "#33B679", "#0B8043",
        "#039BE5", "#3F51B5", "#7986CB",
        "#8E24AA", "#616161"
    ];
    /* const colors = tokens(theme.palette.mode); */
    const [isLoading, setLoading] = useState(false);
    const [isValidStaff, setValidStaff] = useState(true);
    const [isValidType, setValidType] = useState(true);
    const [isValidTitle, setValidTitle] = useState(true);
    const [openSchedule, setOpenSchedule] = useState(false);
    const [currentEvents, setCurrentEvents] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [types, setTypes] = useState([]);
    const [currentEvent, setCurrentEvent] = useState({});
    const [fragEvent, setFragEvent] = useState({});
    const [isRender, setRender] = useState(false);

    useEffect(() => {
        (async () => {
            await StaffService.getAllStaffs()
                .then(res => {
                    let staffs = res.data.payload;
                    setStaffs(
                        staffs.map(staff => ({
                            id: staff.id,
                            label: staff.fullname ? staff.fullname : "Chưa cung cấp",
                            username: staff.username
                        }))
                    );
                });
            await ScheduleService.getAllType()
                .then(res => {
                    let types = res.data.payload;
                    setTypes(
                        types.map(type => ({
                            id: type.id,
                            label: type.typeName,
                        }))
                    );
                });
        })()
    }, [])
    useEffect(() => {
        (async () => {
            await ScheduleService.getAllSchedules()
                .then(res => {
                    setSchedules(res.data.payload);
                });
        })()
    }, [isRender])
    useEffect(() => {
        if (id && schedules.length > 0) {
            let curEvent = schedules.filter(schedule => schedule.id === id)[0];
            setCurrentEvent(curEvent);
            setFragEvent(curEvent);

            setOpenSchedule(true);
        }
    }, [id, schedules])

    const handleDateClick = async (selected) => {
        let event = {
            start: selected.startStr,
            end: selected.endStr
        };
        setCurrentEvent(event);
        setFragEvent(event);
        setOpenSchedule(true);
    };

    const handleEventClick = (selected) => {
        let event = {
            id: selected.event.id,
            color: selected.event.backgroundColor,
            start: selected.event.startStr,
            end: selected.event.endStr,
            typeId: selected.event.extendedProps.type.id,
            title: selected.event.title,
            type: {
                id: selected.event.extendedProps.type.id,
                label: selected.event.extendedProps.type.typeName
            },
            adminIds: selected.event.extendedProps.AdminSchedules.map(schedule => schedule.admin.id),
            admins: selected.event.extendedProps.AdminSchedules.map(schedule => ({
                id: schedule.admin.id,
                label: schedule.admin.fullname ? schedule.admin.fullname : <i>Chưa cung cấp</i>,
                username: schedule.admin.username
            }))
        };
        setCurrentEvent(event);
        setFragEvent(event);
        setOpenSchedule(true);
    };

    const handleSchedule = async () => {
        setLoading(true);
        let { id, admins, type, color, ...event } = currentEvent;
        if ((!currentEvent.admins || (currentEvent.admins && currentEvent.admins.length === 0))
            || !currentEvent.type || !currentEvent.title) {
            if (!currentEvent.admins || (currentEvent.admins && currentEvent.admins.length === 0)) {
                setValidStaff(false);
            }
            if (!currentEvent.type) {
                setValidType(false);
            }
            if (!currentEvent.title) {
                setValidTitle(false);
            }
            setLoading(false);
            return;
        }
        if (deepObjectEqual(currentEvent, fragEvent)) {
            emptyState();
            if (id && id.length === 36) {
                Swal.fire({
                    icon: 'success',
                    title: "Thành công",
                    text: "Đã cập nhật lịch trình thành công",
                    showConfirmButton: false,
                    timer: 1500
                })
            } else {
                Swal.fire({
                    icon: 'success',
                    title: "Thành công",
                    text: "Đã thêm lịch trình thành công",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                })
            }
            return;
        }
        if (id && id.length === 36) {
            await ScheduleService.updateSchedule(id, {
                ...event,
                color: color ? color : "#039BE5"
            })
                .then(async (res) => {
                    let schedule = res.data.payload;
                    let staffIds = schedule.AdminSchedules.map(as => as.adminId);
                    await addDocument("notifications", {
                        title: "Cập nhật lịch trình",
                        message: `Lịch trình ${event.title} đã được cập nhật thông tin.`,
                        usePath: null,
                        staffPath: `/calendar/${event.id}`,
                        readBy: [],
                        image: null,
                        receivedId: staffIds,
                        status: 1
                    });
                    setLoading(false);
                    emptyState();
                    setRender(prev => !prev);
                    Swal.fire({
                        icon: 'success',
                        title: "Thành công",
                        text: "Đã cập nhật lịch trình thành công",
                        showConfirmButton: false,
                        timer: 1500
                    })
                })
        } else {
            await ScheduleService.createSchedule({
                ...event,
                color: color ? color : "#039BE5"
            })
                .then(async (res) => {
                    let staffIds = res.data.staffIds;
                    await addDocument("notifications", {
                        title: "Lịch trình mới",
                        message: `Lịch trình ${event.title} đã được thêm vào kế hoạch.`,
                        usePath: null,
                        staffPath: `/calendar/${event.id}`,
                        readBy: [],
                        image: null,
                        receivedId: staffIds,
                        status: 1
                    });
                    setLoading(false);
                    setRender(prev => !prev);
                    emptyState();
                    Swal.fire({
                        icon: 'success',
                        title: "Thành công",
                        text: "Đã thêm lịch trình thành công",
                        showConfirmButton: false,
                        timer: 1500
                    })
                })
        }
    }

    const handleChangeScheduleDate = async (event) => {
        Swal.fire({
            icon: 'info',
            title: "Cập nhật thời gian",
            text: `Đồng ý cập nhật thời gian của lịch trình ${event.event.title} ?`,
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy bỏ',
        })
            .then(async (result) => {
                if (result.isConfirmed) {
                    await ScheduleService.updateSchedule(event.event.id, {
                        start: event.event.startStr,
                        end: event.event.endStr,
                    })
                        .then(async (res) => {
                            let schedule = res.data.payload;
                            let staffIds = schedule.AdminSchedules.map(as => as.adminId);
                            await addDocument("notifications", {
                                title: "Cập nhật lịch trình",
                                message: `Lịch trình ${schedule.title} đã được cập nhật thời gian.`,
                                usePath: null,
                                staffPath: `/calendar/${schedule.id}`,
                                readBy: [],
                                image: null,
                                receivedId: staffIds,
                                status: 1
                            });
                            setRender(prev => !prev);
                        })
                }
            })
    }

    const handleDeleteSchedule = async () => {
        Swal.fire({
            icon: 'warning',
            title: "Cảnh báo",
            text: "Đồng ý xóa lịch trình này ? ",
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy bỏ',
        })
            .then(async (result) => {
                if (result.isConfirmed) {
                    await ScheduleService.deleteSchedule(currentEvent.id)
                        .then(res => {
                            setRender(prev => !prev);
                            emptyState();
                        });
                }
            });
    }

    const handleCloseSchedule = async () => {
        if (!deepObjectEqual(currentEvent, fragEvent)) {
            Swal.fire({
                icon: 'warning',
                title: "Cảnh báo",
                text: "Thay đổi của bạn sẽ không được lưu. Đồng  ý hủy?",
                showCancelButton: true,
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Hủy bỏ',
            })
                .then(result => {
                    if (result.isConfirmed) {
                        if (id) {
                            navigate("/calendar");
                        } else {
                            emptyState();
                        }
                    }
                });
        } else {
            if (id) {
                navigate("/calendar");
            } else {
                emptyState();
            }
        }

    }

    const emptyState = () => {
        setOpenSchedule(false);
        setValidStaff(true);
        setValidType(true);
        setValidTitle(true);
        setCurrentEvents([]);
        setCurrentEvent({});
    }

    return (
        <>
            <Box m="20px">
                <Box className="breadcrumb">
                    <Breadcrumb routeSegments={[{ name: "Lịch trình" }]} />
                </Box>
                <SimpleCard>
                    <Box flex="1 1 100%" ml="15px" className="fc-litera">
                        <FullCalendar
                            locale={viLocale}
                            height="75vh"
                            plugins={[
                                dayGridPlugin,
                                timeGridPlugin,
                                interactionPlugin,
                                listPlugin
                            ]}
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                            }}
                            initialView="dayGridMonth"
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            select={handleDateClick}
                            eventClick={handleEventClick}
                            eventsSet={(events) => setCurrentEvents(events)}
                            events={schedules}
                            eventResize={handleChangeScheduleDate}
                            eventDrop={handleChangeScheduleDate}
                        />
                    </Box>
                </SimpleCard>
            </Box>
            <Dialog
                open={openSchedule}
                onClose={handleCloseSchedule}
                aria-labelledby="add-schedule"
                fullWidth
                sx={{ '& .MuiPaper-root': { backgroundColor: currentEvent.color } }}

            >
                <DialogTitle
                    id="add-schedule"
                    sx={{ color: currentEvent.color ? "#FAFAFA" : "" }}
                >{currentEvent.id && currentEvent.id.length === 36 ? "Chỉnh sửa" : "Thêm"} lịch trình</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: currentEvent.color ? "#F5F5F4" : "" }}>
                        {currentEvent.id && currentEvent.id.length === 36 ? "Chỉnh sửa" : "Thêm"} lịch trình cho một hoặc nhiều nhân viên
                    </DialogContentText>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item lg={8} md={8} sm={12} xs={12}>
                            {
                                staffs && staffs.length > 0 &&
                                <Autocomplete
                                    disablePortal
                                    multiple
                                    options={staffs}
                                    sx={{
                                        minWidth: "fit-content", my: 1,
                                        '& fieldset': {
                                            borderColor: currentEvent.color ? "#D6D3D1" : ""
                                        },
                                        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: currentEvent.color ? "#FAFAFA" : ""
                                        },
                                        '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            border: currentEvent.color ? "2px solid #FAFAFA" : ""
                                        },
                                        '& input, & label': {
                                            color: currentEvent.color ? "#FAFAFA !important" : ""
                                        },
                                        '& .MuiIconButton-root': {
                                            backgroundColor: currentEvent.color ? "#FAFAFA" : "",
                                            marginLeft: currentEvent.color ? "6px" : ""
                                        },
                                        '& .MuiIconButton-root:hover': {
                                            backgroundColor: currentEvent.color ? "#fafafa80" : ""
                                        }
                                    }}
                                    value={currentEvent.admins || []}
                                    onChange={
                                        (event, newValue) => {
                                            if (newValue) {
                                                setValidStaff(true);
                                            } else {
                                                setValidStaff(false);
                                            }
                                            setCurrentEvent(prev => ({ ...prev, admins: newValue, adminIds: newValue.map(admin => admin.id) }))

                                        }
                                    }
                                    getOptionLabel={(option) => option.label || ""}
                                    renderOption={(props, option) => {
                                        return (
                                            <li {...props} key={option.id} style={{ color: currentEvent.color ? "#FAFAFA" : "" }}>
                                                {option.username} | {option.label}
                                            </li>
                                        );
                                    }}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                sx={{
                                                    backgroundColor: "#fff",
                                                    '& .MuiChip-label': {
                                                        color: currentEvent.color
                                                    }
                                                }}
                                                variant="outlined"
                                                label={option.username}
                                                {...getTagProps({ index })}
                                            />
                                        ))
                                    }
                                    renderInput={
                                        (params) =>
                                            <TextField {...params} label="Nhân viên" size="medium"
                                                helperText={isValidStaff ? "" : "Hãy chọn nhân viên!"}
                                                error={isValidStaff ? false : true}
                                            />
                                    }
                                />
                            }
                        </Grid>
                        <Grid item lg={4} md={4} sm={12} xs={12}>
                            {
                                types && types.length > 0 &&
                                <Autocomplete
                                    disablePortal
                                    options={types}
                                    sx={{
                                        minWidth: "fit-content", my: 1,
                                        '& fieldset': {
                                            borderColor: currentEvent.color ? "#D6D3D1" : ""
                                        },
                                        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: currentEvent.color ? "#FAFAFA" : ""
                                        },
                                        '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            border: currentEvent.color ? "2px solid #FAFAFA" : ""
                                        },
                                        '& input, & label': {
                                            color: currentEvent.color ? "#FAFAFA !important" : ""
                                        },
                                        '& .MuiIconButton-root': {
                                            backgroundColor: currentEvent.color ? "#FAFAFA" : "",
                                            marginLeft: currentEvent.color ? "6px" : ""
                                        },
                                        '& .MuiIconButton-root:hover': {
                                            backgroundColor: currentEvent.color ? "#fafafa80" : ""
                                        }
                                    }}
                                    value={currentEvent.type || null}
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setValidType(true);
                                        } else {
                                            setValidType(false);
                                        }
                                        setCurrentEvent(prev => ({ ...prev, typeId: newValue ? newValue.id : null, type: newValue }))
                                    }}
                                    getOptionLabel={(option) => option.label || ""}
                                    renderOption={(props, option) => {
                                        return (
                                            <li {...props} key={option.id}
                                                style={{ color: currentEvent.color ? "#FAFAFA" : "" }}
                                            >
                                                {option.label}
                                            </li>
                                        );
                                    }}
                                    renderInput={
                                        (params) =>
                                            <TextField {...params} label="Loại lịch trình" size="medium"
                                                helperText={isValidType ? "" : "Hãy chọn loại sự kiện!"}
                                                error={isValidType ? false : true}
                                            />
                                    }
                                />
                            }
                        </Grid>
                        <Box>
                            <List sx={{ display: "flex", flexWrap: "wrap", paddingLeft: "20px" }}>
                                {colors.map((color, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            border: color === currentEvent.color ? "5px solid #fff" : "",
                                            backgroundColor: color,
                                            width: "25px",
                                            height: "25px",
                                            margin: "8px 12px",
                                            borderRadius: "50%",
                                            padding: "8px !important",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => setCurrentEvent(prev => ({ ...prev, color: color }))}
                                    />
                                ))}
                            </List>
                        </Box>
                        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ paddingTop: "0 !important" }}>
                            <TextField
                                multiline
                                rows={4}
                                name="title"
                                label="Tiêu đề"
                                onChange={(event) => {
                                    if (event.target.value !== "") {
                                        setValidTitle(true);
                                    } else {
                                        setValidTitle(false);
                                    }
                                    setCurrentEvent(prev => ({ ...prev, title: event.target.value }))
                                }}
                                value={currentEvent.title || ""}
                                sx={{
                                    width: "100%", margin: "8px 0",
                                    '& fieldset': {
                                        borderColor: currentEvent.color ? "#D6D3D1" : ""
                                    },
                                    '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: currentEvent.color ? "#FAFAFA" : ""
                                    },
                                    '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        border: currentEvent.color ? "2px solid #FAFAFA" : ""
                                    },
                                    '& textarea, & label': {
                                        color: currentEvent.color ? "#FAFAFA !important" : ""
                                    }
                                }}
                                helperText={isValidTitle ? "" : "Hãy nhập tiêu đề sự kiện!"}
                                error={isValidTitle ? false : true}
                            />
                        </Grid>
                    </Grid>

                </DialogContent>
                <DialogActions sx={{ padding: "0 24px 10px", justifyContent: (currentEvent.id && currentEvent.id.length === 36) ? "space-between" : "end" }}>
                    {
                        currentEvent.id && currentEvent.id.length === 36 &&
                        <Button onClick={handleDeleteSchedule} variant="contained">
                            Xóa
                        </Button>
                    }
                    <Box>
                        <Button onClick={handleCloseSchedule} variant="contained"
                            sx={{ marginRight: "8px" }}
                        >
                            Hủy
                        </Button>
                        <LoadingButton
                            onClick={handleSchedule} variant="contained"
                            type="button" loading={isLoading}
                        >
                            Lưu
                        </LoadingButton >
                    </Box>
                </DialogActions>
            </Dialog >
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );
};

export default Calendar;