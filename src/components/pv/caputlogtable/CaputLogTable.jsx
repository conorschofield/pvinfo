import React, { useState } from "react";
import { SearchProvider } from "@elastic/react-search-ui";
import { Accordion, AccordionDetails, AccordionSummary, Typography, Box, TextField, InputAdornment } from "@mui/material";
import { ErrorBoundary, Facet, PagingInfo, ResultsPerPage, Paging, useSearch } from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import CaputLogDataTable from "./CaputLogDataTable";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import moment from "moment";
import PropTypes from "prop-types";
import api from "../../../api";

const propTypes = {
    pvName: PropTypes.string,
}

function CaputLogTable(props) {

    const [caputLogExpanded, setCaputLogExpanded] = useState(false);
    const handleCaputLogExpandedChange = () => (event, isExpanded) => {
        setCaputLogExpanded(isExpanded);
    }

    const searchConfig = {
        alwaysSearchOnInitialLoad: true,
        apiConnector: api.CAPUTLOG_CONNECTOR,
        hasA11yNotifications: true,
        trackUrlState: false,
        searchQuery: {
            filters: [{
                field: "pv.keyword",
                values: [props.pvName],
            },],
            search_fields: {
                pv: {
                    weight: 3
                },
            },
            result_fields: {
                old: { raw: {} },
                user: { raw: {} },
                message: { raw: {} },
                pv: { raw: {} },
                client: { raw: {} },
                new: { raw: {} },
                "@ioctimestamp": { raw: {} },
                "@timestamp": { raw: {} },
                timestamp: { raw: {} },
                id: { raw: {} }
            },
            facets: {
                "user.keyword": { type: "value", size: 30, sort: "count" },
                "client.keyword": { type: "value", size: 30, sort: "count" },
            }
        },
    };

    const ElasticsearchProvider = () => {
        const [startDate, setStartDate] = useState(null);
        const [endDate, setEndDate] = useState(null);
        const { wasSearched, setFilter, results } = useSearch();
        const onDateChange = (dates) => {
            const [start, end] = dates;

            // Set startDate to the beginning of the day
            const adjustedStartDate = start ? moment(start).startOf("day").toDate() : null;

            // Set endDate to the end of the day
            const adjustedEndDate = end ? moment(end).endOf("day").toDate() : null;

            setStartDate(adjustedStartDate);
            setEndDate(adjustedEndDate);

            if (!adjustedStartDate || !adjustedEndDate) {
                clearFilters(["@timestamp"]);
            } else {
                //clearFilters();
                setFilter("@timestamp", {
                    name: "@timestamp",
                    from: adjustedStartDate.toISOString(),
                    to: adjustedEndDate.toISOString(),
                });
            }
        };
        return (
            <div>
                <ErrorBoundary>
                    <Layout
                        header={
                            <Box sx={{
                                width: "100%",
                                maxWidth: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }} >
                                <DatePicker
                                    selected={startDate}
                                    onChange={onDateChange}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectsRange={true}
                                    showPreviousMonths
                                    monthsShown={2}
                                    placeholderText="Date Range for Caput Log Data"
                                    withPortal
                                    customInput={
                                        <TextField
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarMonthIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            variant="outlined"
                                            size="small"
                                            placeholder="Date Range for Caput Log Data"
                                        />
                                    } />
                            </Box>
                        }
                        bodyContent={
                            wasSearched ? (
                                <CaputLogDataTable results={results} />
                            ) : (
                                <p>No results to display.</p>
                            )
                        }
                        sideContent={
                            <div>
                                {wasSearched}
                                <Facet
                                    field="user.keyword"
                                    label="User"
                                    filterType="any"
                                    isFilterable={false}
                                />
                                <Facet
                                    field="client.keyword"
                                    label="Client"
                                    filterType="any"
                                    isFilterable={false}
                                />
                            </div>
                        }
                        bodyHeader={
                            <React.Fragment>
                                {wasSearched && <PagingInfo />}
                                {wasSearched && (
                                    <div style={{ position: 'relative', zIndex: 20, marginBottom: '10px' }}>
                                        <ResultsPerPage />
                                    </div>
                                )}
                            </React.Fragment>
                        }
                        bodyFooter={<Paging />}
                    />
                </ErrorBoundary>
            </div>
        );
    };

    return (
        <Accordion expanded={caputLogExpanded} onChange={handleCaputLogExpandedChange()}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="caputLog-content" id="caputLog-header">
                <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>Caput Log Data</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, }}>
                <SearchProvider config={searchConfig}>
                    <ElasticsearchProvider />
                </SearchProvider>
            </AccordionDetails>
        </Accordion>
    );
}

CaputLogTable.propTypes = propTypes;
export default CaputLogTable;
