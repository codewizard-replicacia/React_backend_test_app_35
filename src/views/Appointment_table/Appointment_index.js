
import { useState, useEffect, createRef } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { AddBox, Edit, Visibility } from "@material-ui/icons";
import MuiTable from "../../components/table/table_index";
import { BASE_URL, PATH_APPOINTMENT } from "../../utils/constants";
import { PATH_PET } from "../../utils/constants";
import { PATH_VISIT } from "../../utils/constants";
import { PATH_PETOWNER } from "../../utils/constants";
import makeApiCall from "../../utils/makeApiCall";

function AppointmentTable() {

  const tableRef = createRef();
  const snackbar = useSnackbar();
  const navigate =  useNavigate();



  const [Pets, setPets] = useState({});

  useEffect(() => {
    const fetchPets = async () => {
      const typesResponse = await makeApiCall(
        `${BASE_URL}${PATH_PET}`
      );
      const jsonResp = await typesResponse.json();

      if (Array.isArray(jsonResp.value) && jsonResp.value.length > 0) {
        const types = {};
        jsonResp.value.forEach((item) => {
          types[`${item.Pet_id}`] = item.PetName
        });
        setPets(types);
      } else {
        snackbar.enqueueSnackbar("No data for Pets. Please Add Pets First.", {
          variant: "warning",
        });
        setPets({});
      }
    };
    fetchPets();
  }, []);


  const [Visits, setVisits] = useState({});

  useEffect(() => {
    const fetchVisits = async () => {
      const typesResponse = await makeApiCall(
        `${BASE_URL}${PATH_VISIT}`
      );
      const jsonResp = await typesResponse.json();

      if (Array.isArray(jsonResp.value) && jsonResp.value.length > 0) {
        const types = {};
        jsonResp.value.forEach((item) => {
          types[`${item.Visit_id}`] = item.Observations
        });
        setVisits(types);
      } else {
        snackbar.enqueueSnackbar("No data for Visits. Please Add Visits First.", {
          variant: "warning",
        });
        setVisits({});
      }
    };
    fetchVisits();
  }, []);


  const [PetOwners, setPetOwners] = useState({});

  useEffect(() => {
    const fetchPetOwners = async () => {
      const typesResponse = await makeApiCall(
        `${BASE_URL}${PATH_PETOWNER}`
      );
      const jsonResp = await typesResponse.json();

      if (Array.isArray(jsonResp.value) && jsonResp.value.length > 0) {
        const types = {};
        jsonResp.value.forEach((item) => {
          types[`${item.Pet_ownerId}`] = item.PetOwnerphone
        });
        setPetOwners(types);
      } else {
        snackbar.enqueueSnackbar("No data for PetOwners. Please Add PetOwners First.", {
          variant: "warning",
        });
        setPetOwners({});
      }
    };
    fetchPetOwners();
  }, []);

  const columns = [
    { title: "AppointmentId", field: "AppointmentId", editable: "never" },
      { title: "DateOfappointment", field: "DateOfappointment" },
      { title: "Petappointment", field: "AppointmentPetappointment", lookup: Pets },
      { title: "Reasonproblem", field: "Reasonproblem" },
      { title: "AppointmentDetails", field: "AppointmentAppointmentDetails", lookup: Visits },
      { title: "Vetpetappointment", field: "AppointmentVetpetappointment", lookup: PetOwners },
  ];
  
  const fetchData = async (query) => {
    return new Promise(async (resolve, reject) => {
      const { page, orderBy, orderDirection, search, pageSize } = query;
      const url = `${BASE_URL}${PATH_APPOINTMENT}`;
      let temp = url; // Initialize with the base URL
      let filterQuery = ""; // Initialize filter query as an empty string
  
      // Handle sorting
      if (orderBy) {
        temp += `?$orderby=${orderBy.field} ${orderDirection}`;
      }
  
      // Handle searching
      if (search) {
        filterQuery = `$filter=contains($screen.getSearchField().getName(), '${search}')`;
        temp += orderBy ? `&${filterQuery}` : `?${filterQuery}`;
      }
  
      // Handle pagination
      if (page > 0) {
        const skip = page * pageSize;
        temp += orderBy || search ? `&$skip=${skip}` : `?$skip=${skip}`;
      }
  
      const countUrl = search ? `${url}/$count?${filterQuery}` : `${BASE_URL}${PATH_APPOINTMENT}/$count`;
      let total = null;

      try {
        const countResponse = await makeApiCall(countUrl);
        const e = await countResponse.text();
        total = parseInt(e, 10);
  
        const response = await makeApiCall(temp);
        const { value } = await response.json();
  
        if (value.length === 0) {
          return resolve({
            data: [],
            page: page,
            totalCount: 0,
            error: "Error fetching data"
          });
        } else {
          return resolve({
            data: value,
            page: page,
            totalCount: total,
          });
        }
      } catch (error) {
        snackbar.enqueueSnackbar(`Trips API call Failed! - ${error.message}`, {
          variant: "error",
        });
        console.error("API call failed:", error);
        reject(error);
      }
    });
  };

  return (
    <div className="product-container">
      <MuiTable
        tableRef={tableRef}
        title="Pet Appointment"
        cols={columns}
        data={fetchData}
        size={5}
        actions={[
          {
            icon: AddBox,
            tooltip: "Add",
            onClick: () => navigate("/Appointments/create"),
            isFreeAction: true,
          },
          {
            icon: Visibility,
            tooltip: "View",
            onClick: (event, rowData) =>
            navigate(`/Appointments/view/${rowData.AppointmentId}`),
          },
          {
            icon: Edit,
            tooltip: "Edit",
            onClick: (event, rowData) =>
            navigate(`/Appointments/edit/${rowData.AppointmentId}`),
          },
        ]}
        onRowDelete={async (oldData) => {
          const resp = await makeApiCall(
            `${BASE_URL}${PATH_APPOINTMENT}(${oldData.AppointmentId})`,
            "DELETE"
          );
          if (resp.ok) {
            tableRef.current.onQueryChange();
            snackbar.enqueueSnackbar("Successfully deleted Appointments", {
              variant: "success",
            });
          } else {
            const jsonData = await resp.json();
            snackbar.enqueueSnackbar(`Failed! - ${jsonData.message}`, {
              variant: "error",
            });
          }
        }}
      />
    </div>
  );
}

export default AppointmentTable;
