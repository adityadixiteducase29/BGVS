import * as React from 'react';
import { DataGrid, gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid';
import { Pagination } from '@mui/material';
import './Datatable.css';

// Custom Pagination Component
function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <div className="datatable-pagination-wrapper">
    <Pagination
      color="primary"
      count={pageCount}
      page={page + 1}
      onChange={(event, value) => apiRef.current.setPage(value - 1)}
      shape="rounded"
      siblingCount={1}
      boundaryCount={2}
      showFirstButton
      showLastButton
      className="datatable-pagination"
    />
  </div>
  );
}



const Datatable = ({ tabledata, columns, pageSize = 8, paginationMode = 'client', rowCount, page, onPageChange, ...rest }) => {
  // Use autoHeight when there are fewer rows than pageSize (only for client-side pagination)
  const shouldUseAutoHeight = paginationMode === 'client' && tabledata.length <= pageSize;
  
  // For server-side pagination, use the provided page and rowCount
  const paginationProps = paginationMode === 'server' ? {
    paginationMode: 'server',
    rowCount: rowCount || tabledata.length,
    paginationModel: {
      page: page !== undefined ? page : 0,
      pageSize: pageSize
    },
    onPaginationModelChange: (model) => {
      if (onPageChange) {
        onPageChange(null, model.page + 1);
      }
    },
    pageSizeOptions: [pageSize]
  } : {
    pageSize: pageSize,
    pagination: true
  };
  
  return (
    <div className="datatable-container">
      <DataGrid
        className="datatable-grid"
        rows={tabledata}
        columns={columns}
        autoHeight={shouldUseAutoHeight}
        slots={{ pagination: CustomPagination }}
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
        disableColumnResize
        disableColumnReorder
        disableColumnSorting
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        {...paginationProps}
        {...rest}
      />
    </div>
  );
};

export default Datatable;