import { useEffect, useState, useRef } from "react";
import React from 'react';
import {
    Grid,
    Pagination, Avatar,
    Box,
    Tabs, Tab, CircularProgress, Divider,
    ListItem, ListItemText, ListItemAvatar, IconButton,
} from "@mui/material";

import ProductService from "../../../services/product.service";
import RateService from "../../../services/rate.service";

import { H2, H4, H1, Span } from "../../../components/Typography";
import { TabPanel, a11yProps } from "../../../components/TabPanel";
import { convertToVND } from "../../../utils/utils";
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import swal from "sweetalert";

const itemsPerPage = 3;

const RatingInfo = ({
    ratings, fiveRatings, fourRatings, threeRatings,
    twoRatings, oneRatings, setLoading, setTemp, ratingScore
}) => {
    const [page, setPage] = useState(1);
    const [fivePage, setFivePage] = useState(1);
    const [fourPage, setFourPage] = useState(1);
    const [threePage, setThreePage] = useState(1);
    const [twoPage, setTwoPage] = useState(1);
    const [onePage, setOnePage] = useState(1);
    const [rateTabValue, setRateTabValue] = useState(0);
    const ratingArr = [
        {
            star: 5,
            percentage: `${(fiveRatings.length / ratings.length) * 100}%`,
            length: fiveRatings.length
        },
        {
            star: 4,
            percentage: `${(fourRatings.length / ratings.length) * 100}%`,
            length: fourRatings.length
        },
        {
            star: 3,
            percentage: `${(threeRatings.length / ratings.length) * 100}%`,
            length: threeRatings.length
        },
        {
            star: 2,
            percentage: `${(twoRatings.length / ratings.length) * 100}%`,
            length: twoRatings.length
        },
        {
            star: 1,
            percentage: `${(oneRatings.length / ratings.length) * 100}%`,
            length: oneRatings.length
        },

    ];
    function handleDeleteRating(ratingId) {
        swal({
            title: "Xóa nội dung",
            text: "Đồng ý xóa nội dung này?",
            icon: "warning",
            buttons: ["Hủy bỏ", "Đồng ý"],
        })
            .then(async (result) => {
                if (result) {
                    setLoading(true);
                    await RateService.deleteRating(ratingId)
                        .then(res => {
                            setTemp(prev => !prev);
                            setLoading(false);
                        });
                } else {
                    /* setLoading(false); */
                }
            });

    }
    const round = (value, precision) => {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }
    return (
        <Grid container spacing={6}>
            <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2, }}>
                <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={rateTabValue}
                        onChange={(event, newValue) => setRateTabValue(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="scrollable auto tabs"
                    >
                        <Tab
                            {...a11yProps(10)}
                            label="Tất cả"
                        />
                        <Tab
                            {...a11yProps(11)}
                            label="5 sao"
                        />
                        <Tab
                            {...a11yProps(12)}
                            label="4 sao"
                        />
                        <Tab
                            {...a11yProps(13)}
                            label="3 sao"
                        />
                        <Tab
                            {...a11yProps(14)}
                            label="2 sao"
                        />
                        <Tab
                            {...a11yProps(15)}
                            label="1 sao"
                        />
                    </Tabs>
                </Box>
                <TabPanel value={rateTabValue} index={0}>
                    {
                        ratings &&
                        ratings
                            .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                            .map(rating => (
                                <ListItem
                                    key={rating.id}
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <IconButton
                                            edge="end" aria-label="comments"
                                            onClick={() => handleDeleteRating(rating.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={rating.user.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={rating.user.firstName + " " + rating.user.lastName}
                                        secondary={
                                            <>
                                                <Span>{rating.remarks}</Span>
                                                <Span sx={{
                                                    display: 'flex'
                                                }}>
                                                    {[...Array(5)].map((_, idx) => (
                                                        <StarIcon
                                                            key={idx}
                                                            fontSize="small"
                                                            sx={{
                                                                color: idx < rating.score ? "orange" : "gray"
                                                            }}
                                                        />
                                                    ))}
                                                </Span>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))
                    }
                    <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                        <Pagination
                            count={Math.ceil(ratings.length / itemsPerPage)}
                            page={page}
                            onChange={(event, val) => setPage(val)}
                            defaultPage={1}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </TabPanel>
                <TabPanel value={rateTabValue} index={1}>
                    {
                        fiveRatings &&
                        fiveRatings
                            .slice((fivePage - 1) * itemsPerPage, fivePage * itemsPerPage)
                            .map(rating => (
                                <ListItem
                                    key={rating.id}
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <IconButton
                                            edge="end" aria-label="comments"
                                            onClick={() => handleDeleteRating(rating.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={rating.user.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={rating.user.firstName + " " + rating.user.lastName}
                                        secondary={
                                            <>
                                                <Span>{rating.remarks}</Span>
                                                <Span sx={{
                                                    display: 'flex'
                                                }}>
                                                    {[...Array(5)].map((_, idx) => (
                                                        <StarIcon
                                                            key={idx}
                                                            fontSize="small"
                                                            sx={{
                                                                color: idx < rating.score ? "orange" : "gray"
                                                            }}
                                                        />
                                                    ))}
                                                </Span>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))
                    }
                    <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                        <Pagination
                            count={Math.ceil(fiveRatings.length / itemsPerPage)}
                            page={page}
                            onChange={(event, val) => setFivePage(val)}
                            defaultPage={1}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </TabPanel>
                <TabPanel value={rateTabValue} index={2}>
                    {
                        fourRatings &&
                        fourRatings
                            .slice((fourPage - 1) * itemsPerPage, fourPage * itemsPerPage)
                            .map(rating => (
                                <ListItem
                                    key={rating.id}
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <IconButton
                                            edge="end" aria-label="comments"
                                            onClick={() => handleDeleteRating(rating.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={rating.user.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={rating.user.firstName + " " + rating.user.lastName}
                                        secondary={
                                            <>
                                                <Span>{rating.remarks}</Span>
                                                <Span sx={{
                                                    display: 'flex'
                                                }}>
                                                    {[...Array(5)].map((_, idx) => (
                                                        <StarIcon
                                                            key={idx}
                                                            fontSize="small"
                                                            sx={{
                                                                color: idx < rating.score ? "orange" : "gray"
                                                            }}
                                                        />
                                                    ))}
                                                </Span>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))
                    }
                    <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                        <Pagination
                            count={Math.ceil(fourRatings.length / itemsPerPage)}
                            page={page}
                            onChange={(event, val) => setFourPage(val)}
                            defaultPage={1}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </TabPanel>
                <TabPanel value={rateTabValue} index={3}>
                    {
                        threeRatings &&
                        threeRatings
                            .slice((threePage - 1) * itemsPerPage, threePage * itemsPerPage)
                            .map(rating => (
                                <ListItem
                                    key={rating.id}
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <IconButton
                                            edge="end" aria-label="comments"
                                            onClick={() => handleDeleteRating(rating.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={rating.user.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={rating.user.firstName + " " + rating.user.lastName}
                                        secondary={
                                            <>
                                                <Span>{rating.remarks}</Span>
                                                <Span sx={{
                                                    display: 'flex'
                                                }}>
                                                    {[...Array(5)].map((_, idx) => (
                                                        <StarIcon
                                                            key={idx}
                                                            fontSize="small"
                                                            sx={{
                                                                color: idx < rating.score ? "orange" : "gray"
                                                            }}
                                                        />
                                                    ))}
                                                </Span>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))
                    }
                    <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                        <Pagination
                            count={Math.ceil(threeRatings.length / itemsPerPage)}
                            page={page}
                            onChange={(event, val) => setThreePage(val)}
                            defaultPage={1}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </TabPanel>
                <TabPanel value={rateTabValue} index={4}>
                    {
                        twoRatings &&
                        twoRatings
                            .slice((twoPage - 1) * itemsPerPage, twoPage * itemsPerPage)
                            .map(rating => (
                                <ListItem
                                    key={rating.id}
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <IconButton
                                            edge="end" aria-label="comments"
                                            onClick={() => handleDeleteRating(rating.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={rating.user.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={rating.user.firstName + " " + rating.user.lastName}
                                        secondary={
                                            <>
                                                <Span>{rating.remarks}</Span>
                                                <Span sx={{
                                                    display: 'flex'
                                                }}>
                                                    {[...Array(5)].map((_, idx) => (
                                                        <StarIcon
                                                            key={idx}
                                                            fontSize="small"
                                                            sx={{
                                                                color: idx < rating.score ? "orange" : "gray"
                                                            }}
                                                        />
                                                    ))}
                                                </Span>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))
                    }
                    <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                        <Pagination
                            count={Math.ceil(twoRatings.length / itemsPerPage)}
                            page={page}
                            onChange={(event, val) => setTwoPage(val)}
                            defaultPage={1}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </TabPanel>
                <TabPanel value={rateTabValue} index={5}>
                    {
                        oneRatings &&
                        oneRatings
                            .slice((onePage - 1) * itemsPerPage, onePage * itemsPerPage)
                            .map(rating => (
                                <ListItem
                                    key={rating.id}
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <IconButton
                                            edge="end" aria-label="comments"
                                            onClick={() => handleDeleteRating(rating.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={rating.user.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={rating.user.firstName + " " + rating.user.lastName}
                                        secondary={
                                            <>
                                                <Span>{rating.remarks}</Span>
                                                <Span sx={{
                                                    display: 'flex'
                                                }}>
                                                    {[...Array(5)].map((_, idx) => (
                                                        <StarIcon
                                                            key={idx}
                                                            fontSize="small"
                                                            sx={{
                                                                color: idx < rating.score ? "orange" : "gray"
                                                            }}
                                                        />
                                                    ))}
                                                </Span>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))
                    }
                    <Box sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                        <Pagination
                            count={Math.ceil(oneRatings.length / itemsPerPage)}
                            page={page}
                            onChange={(event, val) => setOnePage(val)}
                            defaultPage={1}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                </TabPanel>
            </Grid>
            <Grid item lg={6} md={6} sm={12} xs={12} sx={{ mt: 2, }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <Box sx={{ position: "relative" }}>
                        <H1 sx={{
                            position: "absolute",
                            top: "29%",
                            left: ("" + ratingScore).length > 1 ? "28%" : "37%",
                            fontSize: "40px"
                        }}>{ratingScore}<Span sx={{ fontSize: "16px" }}>/5</Span></H1>
                        <CircularProgress
                            variant="determinate" size={150}
                            value={(ratingScore / 5).toFixed(2) * 100}
                            thickness={5}
                            sx={{ color: "orange" }}
                        />
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {[...Array(5)].map((_, idx) => {
                            let widthPercent;
                            if (idx + 1 >= ratingScore) {
                                if (ratingScore - idx > 0) {
                                    widthPercent = ((round(ratingScore - idx, 2) + 0.08) * 100).toString() + "%";
                                } else {
                                    widthPercent = "0%";
                                }
                            }

                            return (
                                <Box
                                    sx={{
                                        position: 'relative'
                                    }} key={idx}
                                >
                                    <Box
                                        sx={{
                                            width: idx + 1 < ratingScore ? "100%" : widthPercent,
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            zIndex: 50,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <StarIcon sx={{ color: "orange" }} />
                                    </Box>
                                    <StarIcon sx={{ color: "gray" }} />
                                </Box>
                            )
                        })}
                    </Box>
                    <H4 sx={{ margin: "8px 0 12px" }}>{ratings.length} đánh giá</H4>
                    <Divider />
                    {
                        ratingArr.map(rate => (
                            <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
                                <Span sx={{
                                    padding: "3px 16px 3px 0",
                                    display: "flex",
                                    alignItems: "center"
                                }}>
                                    {rate.star} <StarIcon sx={{ color: "orange" }} />
                                </Span>
                                <Box className="progress" sx={{
                                    width: "85%"
                                }}>
                                    <div className="progress-bar bg-warning" role="progressbar" style={{
                                        width: rate.percentage
                                    }} aria-valuenow="8" aria-valuemin="0" aria-valuemax="100"></div>
                                </Box>
                                <Span sx={{
                                    padding: "3px 0 3px 16px",
                                    width: "60px"
                                }}>{rate.length}</Span>
                            </Box>
                        ))
                    }


                </Box>

            </Grid>
        </Grid >
    )
}

export default RatingInfo