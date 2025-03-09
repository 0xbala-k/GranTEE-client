import { granTEEContract } from "./GranTEE.ts";
import { Scholarship, UserProfile } from "../types";
import axios from "axios";

const GRANTEE_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const API_URL = import.meta.env.VITE_API_URL;

interface ScholarshipResp {
    scholarshipId: number;
    creator: string;
    balance: string;
}

interface uploadScholarshipData {
    id: string;
    title: string;
    maxAmountPerApplicant: number;
    deadline: string;
    applicants: number;
    description: string;
    requirements: string[];
}

interface uploadUserDataRequest {
    wallet_address: string;
    signature: string;
    data: string;
}

interface ApplicationData{
    essay: string;
}

enum ApplicationStatus {
    Pending = 0,
    Reviewed = 1,
    Accepted = 2,
    Rejected = 3,
  }

interface Application {
    scholarshipId: number;
    exists: boolean;
    paid: boolean;
    dataHash: string;
    status: ApplicationStatus;
}

// Wallet Connection
export async function connectWallet(): Promise<string> {
    const account = await granTEEContract.connect();
    await granTEEContract.initializeContract(GRANTEE_CONTRACT_ADDRESS);
    return account;
}
  
export async function disconnectWallet(): Promise<void> {
    await granTEEContract.disconnect();
}

export async function getCurrentAccount(): Promise<string | null> {
    try {
        const [account] = await window.ethereum.request({ method: "eth_accounts" });
        if (account) {
            await granTEEContract.initializeContract(GRANTEE_CONTRACT_ADDRESS);
        }
        return account || null;
    } catch (error) {
        console.error("Error checking current account:", error);
        return null;
    }
}

export function setupAccountChangeListener(
    onAccountChange: (accounts: string[]) => void
    ): () => void {
    if (!window.ethereum) return () => {};
        window.ethereum.on("accountsChanged", onAccountChange);
    return () => {
        window.ethereum.removeListener("accountsChanged", onAccountChange);
    };
}

export async function getScholarships(): Promise<Scholarship[]> {
    const processedScholarships: Scholarship[] = [];
    const scholarships: ScholarshipResp[] = await granTEEContract.getActiveScholarships();
    for (const resp of scholarships){
        try{
            const getResponse =await axios.get(`${API_URL}/scholarship/${resp.scholarshipId}`);
            const scholarshipData = getResponse.data.scholarship;
            console.log("Scholarship data: ",scholarshipData)
            processedScholarships.push({
                id: resp.scholarshipId+"",
                creator: resp.creator,
                title: scholarshipData.title,
                description: scholarshipData.description,
                maxAmountPerApplicant: scholarshipData.maxAmountPerApplicant,
                deadline: scholarshipData.deadline,
                applicants: scholarshipData.applicants,
                balance: Number(resp.balance),
                requirements: scholarshipData.requirements,
            });
        }catch(error){
            console.log(`Couldn't get scholarship data for : ${resp.scholarshipId}`,error)
        }      
    }
    return processedScholarships;
}

export async function getScholarshipsByCreator(creator: string): Promise<Scholarship[]> {
    const processedScholarships: Scholarship[] = [];
    const scholarships: ScholarshipResp[] = await granTEEContract.getScholarshipsByCreator(creator);
    for (const resp of scholarships){
        try{
            const getResponse =await axios.get(`${API_URL}/scholarship/${resp.scholarshipId}`);
            const scholarshipData = getResponse.data.scholarship;
            console.log("Scholarship data: ",scholarshipData)
            processedScholarships.push({
                id: resp.scholarshipId+"",
                creator: resp.creator,
                title: scholarshipData.title,
                description: scholarshipData.description,
                maxAmountPerApplicant: scholarshipData.maxAmountPerApplicant,
                deadline: scholarshipData.deadline,
                applicants: scholarshipData.applicants,
                balance: Number(resp.balance),
                requirements: scholarshipData.requirements,
            });
        }catch(error){
            console.log(`Couldn't get scholarship data for : ${resp.scholarshipId}`,error)
        }      
    }
    return processedScholarships;
}

export async function getScholarshipById(scholarshipId: number): Promise<Scholarship> {
    const scholarshipResp: ScholarshipResp = await granTEEContract.getScholarshipById(scholarshipId);
    let scholarshipData: uploadScholarshipData = {
          id: scholarshipResp.scholarshipId+"",
          title: "",
          description: "",
          maxAmountPerApplicant: 0,
          deadline: "",
          applicants: 0,
          requirements: [],
    }
    try{
        const getResponse = await axios.get(`${API_URL}/scholarship/${scholarshipId}`);
        scholarshipData = getResponse.data.scholarship;
    }catch(error){
        console.log("Couldn't get scholarship data: ",error)
    }
    
    const scholarship: Scholarship = {
        id: scholarshipResp.scholarshipId+"",
        creator: scholarshipResp.creator,
        title: scholarshipData.title,
        description: scholarshipData.description,
        maxAmountPerApplicant: scholarshipData.maxAmountPerApplicant,
        deadline: scholarshipData.deadline,
        applicants: scholarshipData.applicants,
        balance: Number(scholarshipResp.balance),
        requirements: scholarshipData.requirements,
    };
    return scholarship;
}

export async function createScholarship(): Promise<void> {
    try{
        const receipt = await granTEEContract.createScholarship()
        console.log("Receipt: ",receipt)
    } catch(error){
        throw new Error("Couldn't create scholarship, error: "+error)
    }
}

// Can be uploaded to IPFS but for the sake of hackathon uploadin it to TEE server
export async function uploadScholarshipData(data: uploadScholarshipData): Promise<void> {
    const id = await granTEEContract.getCounter();
    data.id=id.toString();
    try{
        const postResponse = await axios.post(`${API_URL}/scholarship`, data);
        console.log("POST Response:", postResponse.data);
    } catch(error){
        throw new Error("Couldn't upload scholarship data, error: "+error)
    }
}

export async function depositFunds(scholarshipId: number, amount: number): Promise<void> {
    try{
        await granTEEContract.depositFunds(scholarshipId,amount)
    } catch(error){
        throw new Error("Couldn't deposit funds, error: "+error)
    }
}

export async function addFundManager(scholarshipId: number, fundManager: string): Promise<void> {
    try{
        await granTEEContract.addFundManager(scholarshipId,fundManager)
    } catch(error){
        throw new Error("Couldn't add fund manager, error: "+error)
    }
}

export async function removeFundManager(scholarshipId: number, fundManager: string): Promise<void> {
    try{
        await granTEEContract.removeFundManager(scholarshipId,fundManager)
    } catch(error){
        throw new Error("Couldn't remove fund manager, error: "+error)
    }
}

export async function getFundManagers(scholarshipId: number): Promise<string[]>{
    try{
        const fundManagers = await granTEEContract.getFundManagers(scholarshipId);
        return fundManagers;
    } catch(error){
        throw new Error("Couldn't remove fund manager, error: "+error)
    }
}

export async function deleteScholarship(scholarshipId: number): Promise<void> {
    try{
        await granTEEContract.deleteScholarship(scholarshipId)
    } catch(error){
        throw new Error("Couldn't delete scholarship, error: "+error)
    }
}

export async function applyScholarship(scholarshipId: number, data: ApplicationData): Promise<void> {
    
    const jsonData = JSON.stringify(data);
    const dataHash = await hashData(jsonData);
    try{
        granTEEContract.applyScholarship(scholarshipId,dataHash)
    } catch(error){
        throw new Error("Couldn't apply for scholarship, error: "+error)
    }
}

export async function invokeAgent(scholarshipId: number, data: ApplicationData, walletAddress: string): Promise<void> {
    const requestData = {
        wallet_address: walletAddress,
        scholarshipId: scholarshipId,
        application_data: data,
      };
      const postResponse = await axios.post(`${API_URL}/apply`, requestData);
      console.log("POST Response:", postResponse.data);
}

export async function getApplications(): Promise<Application[]> {
    const applications: Application[] = await granTEEContract.getUserApplications();
    return applications;
}

export async function uploadUserData(data: UserProfile): Promise<void> {
    try {
        const walletAddress = await getCurrentAccount();
        if (!walletAddress) {
          throw new Error("Wallet not connected");
        }
        const signer = await granTEEContract.getSigner();
        const message = JSON.stringify(data);
        const signature = await signer.signMessage(message);
        const requestData: uploadUserDataRequest = {
          wallet_address: walletAddress,
          signature,
          data: message,
        };
        const postResponse = await axios.post(`${API_URL}/user`, requestData);
        console.log("POST Response:", postResponse.data);
      } catch (error) {
        console.error("Error in POST user data:", error);
      }
}

export async function getUserData(): Promise<UserProfile> {
    let userProfile: UserProfile = {
        github:"",
        linkedIn:"",
        google:"",
        twitter:"",
    }
    try {
        const walletAddress = await getCurrentAccount();
        if (!walletAddress) {
          throw new Error("Wallet not connected");
        }

        const signer = await granTEEContract.getSigner();
        const message = walletAddress.toLowerCase();
        const signature = await signer.signMessage(message);

        const getResponse = await axios.get(`${API_URL}/user/${walletAddress}`, {
          params: {
            signature: signature
          }
        });
        userProfile=getResponse.data.data;
      } catch (error) {
        console.error("Error in GET user data:", error);
      }
      return userProfile;
}

async function hashData(data: string): Promise<string> {
    // Encode the input string as an ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Compute the SHA-256 digest
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  
    // Convert the ArrayBuffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}