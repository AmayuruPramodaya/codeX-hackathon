from django.core.management.base import BaseCommand
from main.models import Province, District, DSDivision, GramaNiladhariDivision


class Command(BaseCommand):
    help = 'Populate administrative divisions from Sri Lankan data'

    def handle(self, *args, **options):
        self.stdout.write('Starting to populate administrative divisions...')
        
        # Sri Lankan administrative division data (sample from Division.php)
        division_data = {
            'Western': {
                'districts': {
                    'Colombo': {
                        'ds_divisions': {
                            'Colombo': [
                                'Sammanthranapura', 'Mattakkuliya', 'Modara', 'Madampitiya',
                                'Mahawatta', 'Aluthmawatha', 'Lunupokuna', 'Bloemendhal',
                                'Kotahena East', 'Kotahena West', 'Kochchikade North'
                            ],
                            'Kolonnawa': [
                                'Wadulla', 'Sedawatta', 'Halmulla', 'Kotuvila',
                                'Veheragoda', 'Orugodawatta', 'Meethotamulla'
                            ],
                            'Kaduwela': [
                                'Welivita', 'Raggahawatta', 'Hewagama', 'Kaduwela',
                                'Pahala Bomiriya', 'Ihala Bomiriya', 'Wekewatta'
                            ]
                        }
                    },
                    'Gampaha': {
                        'ds_divisions': {
                            'Negombo': [
                                'Kammalthura', 'Pallansena North', 'Kochchikade',
                                'Pallansena South', 'Daluwakotuwa', 'Palangathure'
                            ],
                            'Katana': [
                                'Muruthana', 'Manaveriya', 'Udangawa', 'Thoppuwa',
                                'Bambukuliya', 'Katana North', 'Katana East'
                            ]
                        }
                    },
                    'Kalutara': {
                        'ds_divisions': {
                            'Panadura': [
                                'Horethuduwa North', 'Horethuduwa', 'Horethuduwa Central',
                                'Horethuduwa South', 'Gorakana', 'Gorakana South'
                            ],
                            'Bandaragama': [
                                'Kidelpitiya West', 'Kidelpitiya East', 'Senapura',
                                'Aluthgama', 'Alothiyawa', 'Walgama North'
                            ]
                        }
                    }
                }
            },
            'Central': {
                'districts': {
                    'Kandy': {
                        'ds_divisions': {
                            'Kandy': [
                                'Kandy City', 'Mahaiyawa', 'Udunuwara',
                                'Kundasale', 'Pathadumbara'
                            ],
                            'Gampola': [
                                'Gampola', 'Nawalapitiya', 'Udapalatha'
                            ]
                        }
                    },
                    'Matale': {
                        'ds_divisions': {
                            'Matale': [
                                'Matale City', 'Yatawatta', 'Dambulla'
                            ]
                        }
                    },
                    'Nuwara Eliya': {
                        'ds_divisions': {
                            'Nuwara Eliya': [
                                'Nuwara Eliya City', 'Maskeliya', 'Kotmale'
                            ]
                        }
                    }
                }
            },
            'Southern': {
                'districts': {
                    'Galle': {
                        'ds_divisions': {
                            'Galle': [
                                'Galle City', 'Akmeemana', 'Hikkaduwa'
                            ],
                            'Ambalangoda': [
                                'Ambalangoda', 'Elpitiya', 'Karandeniya'
                            ]
                        }
                    },
                    'Matara': {
                        'ds_divisions': {
                            'Matara': [
                                'Matara City', 'Weligama', 'Kamburupitiya'
                            ]
                        }
                    },
                    'Hambantota': {
                        'ds_divisions': {
                            'Hambantota': [
                                'Hambantota City', 'Tangalle', 'Tissamaharama'
                            ]
                        }
                    }
                }
            },
            'Northern': {
                'districts': {
                    'Jaffna': {
                        'ds_divisions': {
                            'Jaffna': [
                                'Jaffna City', 'Nallur', 'Chavakachcheri'
                            ]
                        }
                    },
                    'Kilinochchi': {
                        'ds_divisions': {
                            'Kilinochchi': [
                                'Kilinochchi', 'Poonakary'
                            ]
                        }
                    },
                    'Mannar': {
                        'ds_divisions': {
                            'Mannar': [
                                'Mannar', 'Musali'
                            ]
                        }
                    },
                    'Vavuniya': {
                        'ds_divisions': {
                            'Vavuniya': [
                                'Vavuniya North', 'Vavuniya South'
                            ]
                        }
                    },
                    'Mullaitivu': {
                        'ds_divisions': {
                            'Mullaitivu': [
                                'Mullaitivu', 'Maritimepattu'
                            ]
                        }
                    }
                }
            },
            'Eastern': {
                'districts': {
                    'Trincomalee': {
                        'ds_divisions': {
                            'Trincomalee': [
                                'Trincomalee City', 'Gomarankadawala'
                            ]
                        }
                    },
                    'Batticaloa': {
                        'ds_divisions': {
                            'Batticaloa': [
                                'Batticaloa City', 'Kaluwanchikudy'
                            ]
                        }
                    },
                    'Ampara': {
                        'ds_divisions': {
                            'Ampara': [
                                'Ampara City', 'Akkaraipattu'
                            ]
                        }
                    }
                }
            },
            'North Western': {
                'districts': {
                    'Kurunegala': {
                        'ds_divisions': {
                            'Kurunegala': [
                                'Kurunegala City', 'Kuliyapitiya'
                            ]
                        }
                    },
                    'Puttalam': {
                        'ds_divisions': {
                            'Puttalam': [
                                'Puttalam', 'Chilaw'
                            ]
                        }
                    }
                }
            },
            'North Central': {
                'districts': {
                    'Anuradhapura': {
                        'ds_divisions': {
                            'Anuradhapura': [
                                'Anuradhapura City', 'Medawachchiya'
                            ]
                        }
                    },
                    'Polonnaruwa': {
                        'ds_divisions': {
                            'Polonnaruwa': [
                                'Polonnaruwa', 'Medirigiriya'
                            ]
                        }
                    }
                }
            },
            'Uva': {
                'districts': {
                    'Badulla': {
                        'ds_divisions': {
                            'Badulla': [
                                'Badulla City', 'Bandarawela'
                            ]
                        }
                    },
                    'Moneragala': {
                        'ds_divisions': {
                            'Moneragala': [
                                'Moneragala', 'Bibile'
                            ]
                        }
                    }
                }
            },
            'Sabaragamuwa': {
                'districts': {
                    'Ratnapura': {
                        'ds_divisions': {
                            'Ratnapura': [
                                'Ratnapura City', 'Eheliyagoda'
                            ]
                        }
                    },
                    'Kegalle': {
                        'ds_divisions': {
                            'Kegalle': [
                                'Kegalle', 'Mawanella'
                            ]
                        }
                    }
                }
            }
        }

        # Create provinces, districts, DS divisions, and GN divisions
        for province_name, province_data in division_data.items():
            province, created = Province.objects.get_or_create(
                name_en=province_name,
                defaults={
                    'name_si': province_name,  # You can add proper Sinhala translations
                    'name_ta': province_name   # You can add proper Tamil translations
                }
            )
            if created:
                self.stdout.write(f'Created province: {province_name}')
            
            for district_name, district_data in province_data['districts'].items():
                district, created = District.objects.get_or_create(
                    name_en=district_name,
                    province=province,
                    defaults={
                        'name_si': district_name,
                        'name_ta': district_name
                    }
                )
                if created:
                    self.stdout.write(f'Created district: {district_name}')
                
                for ds_division_name, gn_divisions in district_data['ds_divisions'].items():
                    ds_division, created = DSDivision.objects.get_or_create(
                        name_en=ds_division_name,
                        district=district,
                        defaults={
                            'name_si': ds_division_name,
                            'name_ta': ds_division_name
                        }
                    )
                    if created:
                        self.stdout.write(f'Created DS division: {ds_division_name}')
                    
                    for gn_division_name in gn_divisions:
                        gn_division, created = GramaNiladhariDivision.objects.get_or_create(
                            name_en=gn_division_name,
                            ds_division=ds_division,
                            defaults={
                                'name_si': gn_division_name,
                                'name_ta': gn_division_name
                            }
                        )
                        if created:
                            self.stdout.write(f'Created GN division: {gn_division_name}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated administrative divisions!')
        )
