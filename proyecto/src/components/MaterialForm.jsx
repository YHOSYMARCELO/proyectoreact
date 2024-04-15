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
/*const useStyles = styled('div')({
  display: 'flex',
  margin: '8px', // Equivalente a theme.spacing(1)
  color: '#fff', // Cambiar a tu color de texto
  backgroundColor: '#f50057', 
});
*/

export default function MaterialForm() {
  //const classes = useStyles(); 

  const [selectedRow, setSelectedRow] = useState(0);
  const [target1, setTarget1] = useState([]);
  const [target2, setTarget2] = useState([]);
  const [getData, setGetData] = useState({
    code: "",
    name: "",
    externalCode: "",
    description: "",
    measureUnitId: 0,
    observations: ""
  });
  const [paginationModel, setPaginationModel] = useState({
    loading: false,
    pageSize: 10,
    page: 0
  });

  useEffect(() => {
    fetch(baseUrl)
      .then(response => response.json())
      .then(data1 => {
        fetch("https://desarrollo.emisuite.es/snc-mf-api/v1/clients/1/tags")
          .then(response => response.json())
          .then(data2 => {
            setTarget1(data1);
            setTarget2(data2);
          })
      })
  }, []);
  /*
  useEffect(() => {
  const fetchData = async () => {
    try {
      const response1 = await fetch(baseUrl);
      const data1 = await response1.json();
      
      const response2 = await fetch("https://desarrollo.emisuite.es/snc-mf-api/v1/clients/1/tags");
      const data2 = await response2.json();
      
      setTarget1(data1);
      setTarget2(data2);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, []);
  */

  const columns = [
    { field: 'id', headerName: 'Id', width: 150 },
    { field: 'code', headerName: 'codigo', width: 150 },
    { field: 'nameMaterial', headerName: 'Nombre', width: 150 },
    { field: 'externalCode', headerName: 'código externo', width: 150 },
    { field: 'description', headerName: 'descripción', width: 150 },
    { field: 'measureUnitId', headerName: 'unidad de Medida', width: 150 },
    { field: 'observations', headerName: 'observaciones', width: 150 },
    {
      field: 'descripcion',
      headerName: 'Description',
      width: 250,
      renderCell: (params) => (
        <>
          <Link to={`/materialtab/${params.row.id}`}>Details</Link>
        </>
      ),
    },
    {
      field: 'details',
      headerName: 'Details',
      width: 250,
      renderCell: (params) => (
        <>
          <Link to={`/material/details/${params.row.id}`}>Description</Link>
        </>
      ),
    },
    {
      field: "imageUuid",
      headerName: 'Avatar',
      width: 200,
      renderCell: (params) =>
        <>
          <Avatar  src={params.value}>{params.value}</Avatar>
        </>
    },
    {
      field: "target",
      headerName: "Target",
      width: 200,
      renderCell: (params) =>
        <>
          {params.value ? params.value.map((tag) => (
            <Chip style={{ marginRight: 5 }} label={tag} color="secondary" />
          )) : <Chip label="sin valor" color="primary"></Chip>}
        </>
    }
  ];

  const rows = target1.map((dat) => {
    const targets = target2.filter((tag) => tag.versionLock === dat.id).map(data => data.name);
    return {
      id: dat.id, code: dat.code, nameMaterial: dat.name, externalCode: dat.externalCode, description: dat.description, measureUnitId:
        dat.measureUnitId, observations: dat.observations, imageUuid: dat.imageUuid ? `${base64Image}` : "N", target: targets.length > 0 ? targets : null
    }
  });

  const handleClick = (params) => {
    setSelectedRow(params.row)
  }

  const handleCreate = async () => {
    if (!getData.code.trim() || !getData.name.trim() || !getData.externalCode.trim() || !getData.description.trim() || !getData.measureUnitId || !getData.observations.trim()) {
      alert("ingresar campos");
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
        const response = await fetch('https://desarrollo.emisuite.es/snc-mf-api/v1/clients/1/materialGenerics', {
          method: "POST",
          body: JSON.stringify(newData),
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error("no connection");
        }
        const data = await response.json();
        setTarget1(previus => ({ ...previus, data }));
        alert("datos ingresados");
      } catch (e) {
        console.log("error de conexión")
      }
    }
  }

  const handleDelete = async () => {
    try {
      await fetch(`https://desarrollo.emisuite.es/snc-mf-api/v1/clients/1/materialGenerics/${selectedRow.id}`, {
        method: "delete",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setTarget1(previus => previus.filter((dato) => dato.id !== selectedRow.id))
      alert("dato eliminado")
    } catch (error) {
      console.log(error)
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
      const response = await fetch(`https://desarrollo.emisuite.es/snc-mf-api/v1/clients/1/materialGenerics/${selectedRow.id}`, {
        method: 'PUT',
        body: JSON.stringify(newData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTarget1(previous => (
          previous.map((dato) => {
            if (dato.id === selectedRow.id) {
              return { ...dato, ...data };
            }
            return dato;
          })
        ));

        alert("¡Dato actualizado correctamente!");
      } else {
        throw new Error("Error al actualizar el dato.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al actualizar el dato. Por favor, inténtalo de nuevo más tarde.");
    }
  };

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
        rows={rows}
        loading={paginationModel.loading}
        columns={columns}
        pageSize={paginationModel.pageSize}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowsPerPageOptions={[5, 10]}
        onPageChange={(newPage) => setPaginationModel(previus => ({ ...previus, page: newPage }))}
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
            onChange={(e) => setGetData(previus => ({ ...previus, code: e.target.value }))}
            helperText="Incorrect entry."
          />

          <TextField
            label="Name"
            value={getData.name}
            onChange={(e) => setGetData(previus => ({ ...previus, name: e.target.value }))}
            id="filled-error"
            variant="filled"
          />
          <TextField
            label="External Code"
            value={getData.externalCode}
            onChange={(e) => setGetData(previus => ({ ...previus, externalCode: e.target.value }))}
            helperText="Incorrect entry."
            variant="filled"
          />

          <TextField
            label="Description"
            value={getData.description}
            onChange={(e) => setGetData(previus => ({ ...previus, description: e.target.value }))}
            id="outlined-error"
            defaultValue="Descripción"
            variant="outlined"
          />
          <TextField
            label="Measure"
            id="standard-select-currency"
            select
            value={getData.measureUnitId}
            onChange={(e) => setGetData(previus => ({ ...previus, measureUnitId: e.target.value }))}
            helperText="Please select your currency"
          >
            {target1.map((option) => (
              <MenuItem key={option.id} value={option.measureUnitId}>
                {option.measureUnitId}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Observations"
            value={getData.observations}
            onChange={(e) => setGetData(previus => ({ ...previus, observations: e.target.value }))}
            id="outlined-error-helper-text"
            helperText="Incorrect entry."
            variant="outlined"
          />

          <Box display="flex" justifyContent="center" width="100%" marginTop={2}>
            <Button onClick={handleCreate} variant="contained" color="secondary" style={{ marginTop: 20, marginRight: 10 }}>
              Create
            </Button>
            <Button onClick={handleUpdate} variant="contained" color="secondary" style={{ marginTop: 20, marginRight: 10 }}>
              Update
            </Button>
            <Button onClick={handleDelete} variant="contained" color="secondary" style={{ marginTop: 20, marginRight: 10 }}>
              Delete
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  )
}
