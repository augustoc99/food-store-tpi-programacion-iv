import { flexRender, type Table } from '@tanstack/react-table';

interface Props<T> {
  tabla: Table<T>;
}

export default function Tabla<T>({ tabla }: Props<T>) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[550px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            {tabla.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : (
                      <button type="button" className="font-semibold" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as 'asc' | 'desc'] ?? ''}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tabla.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-4 py-3 text-sm">
        <button className="btn-secondary" disabled={!tabla.getCanPreviousPage()} onClick={() => tabla.previousPage()}>Anterior</button>
        <span>Página {tabla.getState().pagination.pageIndex + 1} de {Math.max(tabla.getPageCount(), 1)}</span>
        <button className="btn-secondary" disabled={!tabla.getCanNextPage()} onClick={() => tabla.nextPage()}>Siguiente</button>
      </div>
    </>
  );
}
