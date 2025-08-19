# Analytics and Reporting

This project exposes aggregated analytics for property managers and provides a
scheduled report job that emails monthly summaries.

## Server

- **Endpoint:** `GET /managers/:cognitoId/analytics`
  - Returns occupancy rate, total revenue received and an application funnel
    breakdown for the manager's properties.
- **Background Job:** `runMonthlyReport` in
  `server/src/jobs/report-job.ts` generates PDF and CSV reports for all managers
  and emails them on the first of each month.

## Client

The dashboard page at
`client/src/app/(dashboard)/managers/analytics.tsx` consumes the analytics API
and visualises the metrics.

## Testing

Server side tests cover the analytics calculations and verify the report job
triggers email delivery with attachments.
