import React, { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { TextField, Typography, Button, MenuItem, Paper, Box } from "@mui/material";
import { Link } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import base64Image from "../images/images";
import Chip from '@mui/material/Chip';

const baseUrl = "https://desarrollo.emisuite.es/snc-mf-api/v1/clients/1/materialGenerics";
const tagsUrl = "https://desarrollo.emisuite.es/snc-mf-api/v1/clients/1/tags";

export default function MaterialForm() {
  const [selectedRow, setSelectedRow] = useState(0);
  const [combinedData, setCombinedData] = useState([]);
  const [pagination, setPagination] = useState({
    loading: false,
    pageSize: 10,
    page: 0,
    totalRows: 0
  });

  const [getData, setGetData] = useState({
    code: "",
    name: "",
    externalCode: "",
    description: "",
    measureUnitId: 0,
    observations: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const materialsResponse = await fetch(`${baseUrl}?pageSize=${pagination.pageSize}&page=${pagination.page}`);
        const materialsData = await materialsResponse.json();

        const tagsResponse = await fetch(`${tagsUrl}?pageSize=${pagination.pageSize}&page=${pagination.page}`);
        const tagsData = await tagsResponse.json();

        // Combine materials and tags data
        const combined = materialsData.data.map(material => {
          const tagsForMaterial = tagsData.data.filter(tag => tag.versionLock === material.id).map(tag => tag.name);
          return { ...material, tags: tagsForMaterial.length > 0 ? tagsForMaterial : null };
        });

        setCombinedData(combined);
        setPagination(prev => ({ ...prev, totalRows: materialsData.totalRows }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [pagination.page, pagination.pageSize]);

  const columns = [
    { field: 'id', headerName: 'Id', width: 150 },
    { field: 'code', headerName: 'Codigo', width: 150 },
    { field: 'nameMaterial', headerName: 'Nombre', width: 150 },
    { field: 'externalCode', headerName: 'Codigo Externo', width: 150 },
    { field: 'description', headerName: 'Descripcion', width: 150 },
    { field: 'measureUnitId', headerName: 'Unidad de Medida', width: 150 },
    { field: 'observations', headerName: 'Observaciones', width: 150 },
    { field: 'tags', headerName: 'Etiquetas', width: 150 },
    {
      field: 'descripcion',
      headerName: 'Descripción',
      width: 250,
      renderCell: (params) => (
        <>
          <Link to={`/materialtab/${params.row.id}`}>Detalles</Link>
        </>
      ),
    },
    {
      field: 'details',
      headerName: 'Detalles',
      width: 250,
      renderCell: (params) => (
        <>
          <Link to={`/material/details/${params.row.id}`}>Descripción</Link>
        </>
      ),
    },
    {
      field: "imageUuid",
      headerName: 'Avatar',
      width: 200,
      renderCell: (params) =>
        <>
          <Avatar src={params.value}>{params.value}</Avatar>
        </>
    }
  ];

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCreate = async () => {
    if (!getData.code.trim() || !getData.name.trim() || !getData.externalCode.trim() || !getData.description.trim() || !getData.measureUnitId || !getData.observations.trim()) {
      alert("Por favor, ingrese todos los campos.");
      return;
    } else {
      const newData = {
        versionLock: null,
        active: true,
        createdAt: null,
        modifiedAt: null,
        modifiedBy: null,
        id: null,
        clientId: 1,
        measureUnitId: parseInt(getData.measureUnitId),
        code: getData.code,
        externalCode: getData.externalCode,
        name: getData.name,
        description: getData.description,
        isVirtual: false,
        imageUuid: null,
        compositionImageUuid: null,
        observations: getData.observations,
        isRawMaterial: false,
        isSemifinished: false,
        isFinished: false
      }
      try {
        const response = await fetch(baseUrl, {
          method: "POST",
          body: JSON.stringify(newData),
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error("Error de conexión");
        }
        const data = await response.json();
        setCombinedData(prevData => [...prevData, data]);
        alert("Datos ingresados exitosamente.");
      } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al conectar con el servidor.");
      }
    }
  }

  const handleDelete = async () => {
    try {
      await fetch(`${baseUrl}/${selectedRow.id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setCombinedData(prevData => prevData.filter(item => item.id !== selectedRow.id));
      alert("Dato eliminado exitosamente.");
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al eliminar el dato. Por favor, inténtelo de nuevo más tarde.");
    }
  }

  const handleUpdate = async () => {
    const newData = {
      versionLock: null,
      active: true,
      createdAt: null,
      modifiedAt: null,
      modifiedBy: null,
      id: parseInt(selectedRow.id),
      clientId: 1,
      measureUnitId: parseInt(getData.measureUnitId),
      code: getData.code,
      externalCode: getData.externalCode,
      name: getData.name,
      description: getData.description,
      isVirtual: false,
      imageUuid: null,
      compositionImageUuid: null,
      observations: getData.observations,
      isRawMaterial: false,
      isSemifinished: false,
      isFinished: false
    }
    try {
      const response = await fetch(`${baseUrl}/${selectedRow.id}`, {
        method: 'PUT',
        body: JSON.stringify(newData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedData = await response.json();
        setCombinedData(prevData => (
          prevData.map(item => {
            if (item.id === updatedData.id) {
              return updatedData;
            }
            return item;
          })
        ));
        alert("¡Dato actualizado correctamente!");
      } else {
        throw new Error("Error al actualizar el dato.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al actualizar el dato. Por favor, inténtelo de nuevo más tarde.");
    }
  };

  const handleClick = (params) => {
    setSelectedRow(params.row)
  }

  return (
    <>
      <div>
        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit">
              DataMaterials
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <DataGrid
        autoHeight
        rows={combinedData}
        columns={columns}
        loading={pagination.loading}
        pageSize={pagination.pageSize}
        rowCount={pagination.totalRows}
        onPageChange={handlePageChange}
        paginationMode="server"
        checkboxSelection
        onRowClick={handleClick}
      />
      <Typography style={{ textAlign: "center", marginTop: 45 }}>Formulario</Typography>
      <Paper elevation={3} style={{ padding: 20 }}>
        <Box style={{ display: "flex", padding: 3, gap: 8, flexDirection: "column", border: 1, alignItems: "center" }} >

          <TextField
            label="Code"
            id="standard-error-helper-text"
            value={getData.code}
            onChange={(e) => setGetData(prev => ({ ...prev, code: e.target.value }))}
            helperText="Entrada incorrecta."
          />

          <TextField
            label="Name"
            value={getData.name}
            onChange={(e) => setGetData(prev => ({ ...prev, name: e.target.value }))}
            id="filled-error"
            variant="filled"
          />
          <TextField
            label="External Code"
            value={getData.externalCode}
            onChange={(e) => setGetData(prev => ({ ...prev, externalCode: e.target.value }))}
            helperText="Entrada incorrecta."
            variant="filled"
          />

          <TextField
            label="Description"
            value={getData.description}
            onChange={(e) => setGetData(prev => ({ ...prev, description: e.target.value }))}
            id="outlined-error"
            defaultValue="Descripcion"
            variant="outlined"
          />
          <TextField
            label="Measure"
            id="standard-select-currency"
            select
            value={getData.measureUnitId}
            onChange={(e) => setGetData(prev => ({ ...prev, measureUnitId: e.target.value }))}
            helperText="Seleccione su moneda"
          >
            {combinedData.map((option) => (
              <MenuItem key={option.id} value={option.measureUnitId}>
                {option.measureUnitId}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Observations"
            value={getData.observations}
            onChange={(e) => setGetData(prev => ({ ...prev, observations: e.target.value }))}
            id="outlined-error-helper-text"
            helperText="Entrada incorrecta."
            variant="outlined"
          />

          <Box display="flex" justifyContent="center" width="100%" marginTop={2}>
            <Button onClick={handleCreate} variant="contained" color="secondary" style={{ marginTop: 20, marginRight: 10 }}>
              Crear
            </Button>
            <Button onClick={handleUpdate} variant="contained" color="secondary" style={{ marginTop: 20, marginRight: 10 }}>
              Actualizar
            </Button>
            <Button onClick={handleDelete} variant="contained" color="secondary" style={{ marginTop: 20, marginRight: 10 }}>
              Eliminar
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  )
}
