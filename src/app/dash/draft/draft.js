"use client"
import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const DraftButton = ({ onApply }) => {
    const [draftData, setDraftData] = useState(null);

    useEffect(() => {
        async function fetchDraft() {
            const response = await fetch('/dash/draft/draftdata');
            const data = await response.json();
            console.log(data);
            setDraftData(data);
        }
        fetchDraft();
    }, []);

    const formatDateToLocalTime = (isoDate) => {
        return new Date(isoDate).toLocaleString();
    };

    const handleApplyClick = (id) => {
        const draft = draftData.find(draft => draft.id === id);
        if (!draft) return;

        const draftToApply = {
            devicedata: draft.Draft_Data, 
            requirement: draft.requirement,
            Organisation: draft.Organisation,
            productionPeriodFrom: draft.productionPeriodFrom,
            productionPeriodTo: draft.productionPeriodTo,
            type: draft.type,
            CoDYear: draft.CoDYear,
            Year: draft.Draft_Data.Year, 
        };

        onApply(draftToApply);
    };

    const handleDeleteClick = async (transactionId) => {
        // Send a POST request to your API endpoint with the Transaction_ID
        const response = await fetch('/dash/draft/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Transaction_ID: transactionId }),
        });
    
        if (response.ok) {
            // If the response is successful, show the success message
            alert("Draft deleted successfully");
            window.location.reload(); // Use window.location.reload() for a full page refresh
        } else {
            // Handle errors or unsuccessful responses here
            alert("Failed to delete draft");
        }
    };

    return (
        <div>
            {draftData && draftData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Requirement</TableHead>
                            <TableHead>Organisation</TableHead>
                            <TableHead>Date Saved</TableHead>
                            <TableHead>Select Draft</TableHead>
                            <TableHead>Delete Draft</TableHead> 
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {draftData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.requirement}</TableCell>
                                <TableCell>{item.Organisation}</TableCell>
                                <TableCell>{formatDateToLocalTime(item.createdAt)}</TableCell>
                                <TableCell>
                                    <button 
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => handleApplyClick(item.id)}
                                    >
                                        Apply
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <button 
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => handleDeleteClick(item.Transaction_ID)}
                                    >
                                        Delete
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p>No Saved Drafts</p>
            )}
        </div>
    );
}

export default DraftButton;
