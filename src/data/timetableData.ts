export interface ClassSlot {
  grade: "Grade 10" | "Grade 11" | "Paper Class";
  group?: string; // "Group 1" | "Group 2"
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  time: string; // e.g. "8.30-10.30 am"
  type: "Theory" | "Revision" | "Paper Class";
}

export interface InstituteTimetable {
  id: string;
  name: string;
  location: string;
  fullName: string;
  badgeColor?: string;
  address?: string;
  phone?: string;
  slots: ClassSlot[];
}

export const institutesData: InstituteTimetable[] = [
  {
    id: "sakya-kiribathgoda",
    name: "SAKYA",
    location: "KIRIBATHGODA",
    fullName: "Sakya Higher Education Institute",
    address: "Kandy Road, Kiribathgoda",
    slots: [
      {
        grade: "Grade 10",
        group: "Group 1",
        day: "Sunday",
        time: "8.30 - 10.30 am",
        type: "Theory",
      },
      {
        grade: "Grade 10",
        group: "Group 2",
        day: "Sunday",
        time: "4.30 - 6.30 pm",
        type: "Theory",
      },
      {
        grade: "Grade 11",
        group: "Group 1",
        day: "Sunday",
        time: "10.30 - 12.30 pm",
        type: "Theory",
      },
      {
        grade: "Grade 11",
        group: "Group 2",
        day: "Sunday",
        time: "2.30 - 4.30 pm",
        type: "Theory",
      },
      {
        grade: "Paper Class",
        day: "Sunday",
        time: "12.30 - 2.30 pm",
        type: "Paper Class",
      },
    ],
  },
  {
    id: "science-image-kadawatha",
    name: "SCIENCE IMAGE",
    location: "KADAWATHA",
    fullName: "Science Image Educational Institute",
    address: "Kandy Road, Kadawatha",
    slots: [
      {
        grade: "Grade 10",
        group: "Group 1",
        day: "Saturday",
        time: "6.15 - 8.15 pm",
        type: "Theory",
      },
      {
        grade: "Grade 10",
        group: "Group 2",
        day: "Thursday",
        time: "4.00 - 6.00 pm",
        type: "Theory",
      },
      {
        grade: "Grade 11",
        group: "Group 1",
        day: "Saturday",
        time: "4.00 - 6.00 pm",
        type: "Theory",
      },
      {
        grade: "Grade 11",
        group: "Group 2",
        day: "Friday",
        time: "4.00 - 6.00 pm",
        type: "Theory",
      },
      {
        grade: "Paper Class",
        day: "Saturday",
        time: "2.00 - 4.00 pm",
        type: "Paper Class",
      },
    ],
  },
  {
    id: "sipsara-gampaha",
    name: "SIPSARA",
    location: "GAMPAHA",
    fullName: "Sipsara Higher Educational Institute",
    address: "Yakkala Road, Gampaha",
    slots: [
      {
        grade: "Grade 10",
        day: "Monday",
        time: "4.00 - 6.00 pm",
        type: "Theory",
      },
      {
        grade: "Grade 11",
        day: "Wednesday",
        time: "4.00 - 6.00 pm",
        type: "Theory",
      },
      {
        grade: "Paper Class",
        day: "Wednesday",
        time: "2.15 - 4.00 pm",
        type: "Paper Class",
      },
    ],
  },
  {
    id: "maxford-ganemulla",
    name: "MAXFORD",
    location: "GANEMULLA",
    fullName: "Maxford Higher Educational Institute",
    address: "Station Road, Ganemulla",
    slots: [
      {
        grade: "Grade 10",
        day: "Monday",
        time: "6.30 - 8.30 pm",
        type: "Theory",
      },
      {
        grade: "Grade 11",
        day: "Wednesday",
        time: "6.30 - 8.30 pm",
        type: "Theory",
      },
      {
        grade: "Paper Class",
        day: "Wednesday",
        time: "8.30 - 10.30 pm",
        type: "Paper Class",
      },
    ],
  },
  {
    id: "vishwa-nittambuwa",
    name: "VISHWA",
    location: "NITTAMBUWA",
    fullName: "Vishwa Higher Education Center",
    address: "Colombo - Kandy Road, Nittambuwa",
    slots: [
      {
        grade: "Grade 10",
        day: "Tuesday",
        time: "4.00 - 6.00 pm",
        type: "Theory",
      },
      {
        grade: "Grade 11",
        day: "Tuesday",
        time: "2.00 - 4.00 pm",
        type: "Theory",
      },
    ],
  },
  {
    id: "maxima-gampaha",
    name: "MAXIMA",
    location: "GAMPAHA",
    fullName: "Maxima Institute of Education",
    address: "Miriswatta, Gampaha",
    slots: [
      {
        grade: "Grade 10",
        day: "Saturday",
        time: "7.30 - 9.30 pm",
        type: "Theory",
      },
      {
        grade: "Grade 11",
        day: "Saturday",
        time: "11.30 am - 1.30 pm",
        type: "Theory",
      },
      {
        grade: "Paper Class",
        day: "Saturday",
        time: "9.30 - 11.30 am",
        type: "Paper Class",
      },
    ],
  },
  {
    id: "shiksha-sapugaskanda",
    name: "SHIKSHA",
    location: "SAPUGASKANDA",
    fullName: "Shiksha Higher Educational Institute",
    address: "Mawaramandiya Road, Sapugaskanda",
    slots: [
      {
        grade: "Grade 10",
        day: "Thursday",
        time: "6.30 - 8.30 pm",
        type: "Theory",
      },
    ],
  },
  {
    id: "siyoneth-ragama",
    name: "SIYONETH",
    location: "RAGAMA",
    fullName: "Siyoneth Educational Institute",
    address: "Thewatta Road, Ragama",
    slots: [
      {
        grade: "Grade 10",
        day: "Friday",
        time: "6.30 - 8.30 pm",
        type: "Theory",
      },
    ],
  },
];
