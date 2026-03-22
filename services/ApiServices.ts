import { IBody } from "@/app/[locale]/admin/business/[id]/page";
import { IUserBody } from "@/app/[locale]/admin/users/add/page";

class Api {
  baseUrl = `***REMOVED***/api/`;

  async login(myData: any) {
    const response = await fetch(`${this.baseUrl}auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(myData),
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      return data.error;
    }
  }

  async getAnalytics(token: string) {
    const response = await fetch(`${this.baseUrl}analytics/dashboard`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await response.json();
    return data.data;
  }

  async getUsers(token: string) {
    const response = await fetch(`${this.baseUrl}users`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await response.json();
    console.log(data);
    return data;
  }

  async getUser(userId: number, token: string) {
    const response = await fetch(`${this.baseUrl}users/${userId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await response.json();
    console.log(data);
    return data;
  }

  async addUser(token: string, myData: IUserBody) {
    const response = await fetch(`${this.baseUrl}users`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(myData),
    });
    const data = await response.json();
    console.log(data);
    return data;
  }

  async changeUser(userId: number, token: string, myData: Body) {
    const response = await fetch(`${this.baseUrl}users/${userId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(myData),
    });
    const data = await response.json();
    console.log(data);
    return data;
  }

  async deleteUser(userId: number, token: string) {
    const response = await fetch(`${this.baseUrl}users/${userId}`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await response.json();
    console.log(data);
    return data;
  }

  async getBusinessType(token: string) {
    const response = await fetch(`${this.baseUrl}business-types`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await response.json();
    console.log(data);
    return data.data;
  }

  async getBusiness(token: string, businessId: string) {
    const response = await fetch(
      `${this.baseUrl}business-types/${businessId}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    const data = await response.json();
    return data.data;
  }

  async uploadImage(token: string, photo: any) {
    const formData = new FormData();
    formData.append("files", photo);
    const response = await fetch(`${this.baseUrl}upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const data = await response.json();
    console.log(data);
    return data;
  }

  async updateBusiness(token: string, businessId: string, myData: IBody) {
    const response = await fetch(
      `${this.baseUrl}business-types/${businessId}`,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ data: myData }),
      },
    );
    const data = await response.json();
    console.log(data);
    return data;
  }

  async addBusiness(token: string, myData: IBody) {
    const response = await fetch(`${this.baseUrl}business-types`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ data: myData }),
    });
    const data = await response.json();
    console.log(data);
    return data;
  }

  async deleteBusiness(token: string, businessId: string) {
    const response = await fetch(
      `${this.baseUrl}business-types/${businessId}`,
      {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    const data = await response.json();
    console.log(data);
    return data;
  }
}


export const myClass = new Api();